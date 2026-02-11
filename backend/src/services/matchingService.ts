import { dbManager } from '../database/connection';
import { resumeVectorBuilder } from '../core/resumeVectorBuilder';
import { tokenizer } from '../core/tokenizer';
import { Job } from '../core/types';

interface MatchResult {
  job_id: string;
  title: string;
  company: string;
  match_score: number;
  explanation: string[];
}

class MatchingService {
  /**
   * Match resume against jobs and return top matches
   */
  async matchResume(resumeText: string, limit: number = 50): Promise<MatchResult[]> {
    const startTime = Date.now();
    
    // Build resume vector
    const resumeVector = resumeVectorBuilder.buildVector(resumeText);
    const resumeTokens = Object.keys(resumeVector);
    
    if (resumeTokens.length === 0) {
      return [];
    }
    
    // Find candidate jobs by matching tokens
    const candidateJobs = await this.findCandidateJobs(resumeTokens, limit * 10);
    
    // Calculate similarity scores for candidates
    const matches = await this.calculateMatches(candidateJobs, resumeVector, resumeText);
    
    // Sort by match score and limit results
    const sortedMatches = matches
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
    
    const duration = Date.now() - startTime;
    console.log(`Resume matching completed in ${duration}ms for ${sortedMatches.length} results`);
    
    return sortedMatches;
  }

  /**
   * Find candidate jobs based on token overlap
   */
  private async findCandidateJobs(tokens: string[], limit: number): Promise<Job[]> {
    const db = dbManager.getDB();
    
    // Create parameter placeholders for tokens
    const tokenPlaceholders = tokens.map(() => '?').join(',');
    
    // Query to find jobs with matching tokens
    const stmt = db.prepare(`
      SELECT DISTINCT j.*, COUNT(jt.token) as token_matches
      FROM jobs j
      INNER JOIN job_tokens jt ON j.id = jt.job_id
      WHERE jt.token IN (${tokenPlaceholders})
      GROUP BY j.id
      ORDER BY token_matches DESC, j.ranking_score DESC
      LIMIT ?
    `);
    
    const params = [...tokens, limit];
    return stmt.all(...params) as Job[];
  }

  /**
   * Calculate detailed match scores for candidate jobs
   */
  private async calculateMatches(
    jobs: Job[], 
    resumeVector: Record<string, number>, 
    resumeText: string
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];
    
    for (const job of jobs) {
      try {
        // Get job tokens
        const jobTokens = await this.getJobTokens(job.id);
        const jobVector = this.buildJobVector(jobTokens);
        
        // Calculate token overlap score
        const tokenOverlapScore = this.calculateTokenOverlapScore(resumeVector, jobVector);
        
        // Calculate skill match score
        const skillMatchScore = this.calculateSkillMatchScore(resumeVector, jobVector);
        
        // Calculate title alignment score
        const titleAlignmentScore = this.calculateTitleAlignmentScore(resumeText, job.title);
        
        // Calculate recency boost (jobs posted in last 30 days get a boost)
        const recencyBoost = this.calculateRecencyBoost(job.posted_date);
        
        // Combine scores using weighted average
        const matchScore = (
          (tokenOverlapScore * 0.5) +
          (skillMatchScore * 0.3) +
          (titleAlignmentScore * 0.1) +
          (recencyBoost * 0.1)
        );
        
        // Generate explanation
        const explanation = this.generateExplanation({
          tokenOverlapScore,
          skillMatchScore,
          titleAlignmentScore,
          recencyBoost
        });
        
        matches.push({
          job_id: job.id,
          title: job.title,
          company: job.company,
          match_score: parseFloat(matchScore.toFixed(4)),
          explanation
        });
      } catch (error) {
        console.error(`Error calculating match for job ${job.id}:`, error);
      }
    }
    
    return matches;
  }

  /**
   * Get tokens for a specific job
   */
  private async getJobTokens(jobId: string): Promise<{ token: string; weight: number }[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare('SELECT token, weight FROM job_tokens WHERE job_id = ?');
    return stmt.all(jobId) as { token: string; weight: number }[];
  }

  /**
   * Build vector representation for a job
   */
  private buildJobVector(jobTokens: { token: string; weight: number }[]): Record<string, number> {
    const vector: Record<string, number> = {};
    jobTokens.forEach(({ token, weight }) => {
      vector[token] = weight;
    });
    return vector;
  }

  /**
   * Calculate token overlap score between resume and job vectors
   */
  private calculateTokenOverlapScore(
    resumeVector: Record<string, number>, 
    jobVector: Record<string, number>
  ): number {
    return resumeVectorBuilder.calculateSimilarity(resumeVector, jobVector);
  }

  /**
   * Calculate skill match score based on shared skills
   */
  private calculateSkillMatchScore(
    resumeVector: Record<string, number>, 
    jobVector: Record<string, number>
  ): number {
    const resumeSkills = new Set(Object.keys(resumeVector));
    const jobSkills = new Set(Object.keys(jobVector));
    
    // Count matching skills
    let matchingSkills = 0;
    for (const skill of resumeSkills) {
      if (jobSkills.has(skill)) {
        matchingSkills++;
      }
    }
    
    // Return ratio of matching skills to total resume skills
    return resumeSkills.size > 0 ? matchingSkills / resumeSkills.size : 0;
  }

  /**
   * Calculate title alignment score based on keyword matching
   */
  private calculateTitleAlignmentScore(resumeText: string, jobTitle: string): number {
    // Tokenize both texts
    const resumeTokens = new Set(tokenizer.tokenize(resumeText));
    const titleTokens = new Set(tokenizer.tokenize(jobTitle.toLowerCase()));
    
    // Count matching tokens
    let matches = 0;
    for (const token of titleTokens) {
      if (resumeTokens.has(token)) {
        matches++;
      }
    }
    
    // Return ratio of matching tokens to total title tokens
    return titleTokens.size > 0 ? matches / titleTokens.size : 0;
  }

  /**
   * Calculate recency boost for jobs posted recently
   */
  private calculateRecencyBoost(postedDate: number): number {
    const now = Math.floor(Date.now() / 1000);
    const daysSincePosted = (now - postedDate) / (24 * 60 * 60);
    
    // Jobs posted in last 30 days get a boost (1.0 to 0.0)
    if (daysSincePosted <= 30) {
      return 1 - (daysSincePosted / 30);
    }
    
    return 0;
  }

  /**
   * Generate explanation for match scores
   */
  private generateExplanation(scores: {
    tokenOverlapScore: number;
    skillMatchScore: number;
    titleAlignmentScore: number;
    recencyBoost: number;
  }): string[] {
    const explanations: string[] = [];
    
    if (scores.tokenOverlapScore > 0.3) {
      explanations.push('Strong token overlap with your resume');
    }
    
    if (scores.skillMatchScore > 0.5) {
      explanations.push('High skill alignment with your expertise');
    }
    
    if (scores.titleAlignmentScore > 0.5) {
      explanations.push('Job title matches your experience');
    }
    
    if (scores.recencyBoost > 0.7) {
      explanations.push('Recently posted job');
    }
    
    if (explanations.length === 0) {
      explanations.push('Moderate match based on available information');
    }
    
    return explanations;
  }
}

export const matchingService = new MatchingService();