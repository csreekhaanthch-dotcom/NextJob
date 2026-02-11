import { dbManager } from '../database/connection';
import { userInterestEngine } from '../core/userInterestEngine';
import { tokenizer } from '../core/tokenizer';
import { skillExtractor } from '../core/skillExtractor';

interface CandidateMatch {
  user_id: string;
  match_score: number;
  score_breakdown: {
    skill_overlap: number;
    experience_alignment: number;
    title_similarity: number;
    location_match: number;
    activity_recency: number;
  };
  explanation: string[];
  candidate_info: {
    name: string;
    email: string;
    resume_preview: string;
    skills: string[];
  };
}

class RecruiterMatchingService {
  /**
   * Match job description to candidates
   */
  async matchJobToCandidates(
    jobId: string,
    jobDescription: string,
    jobTitle: string,
    jobLocation: string,
    limit: number = 50
  ): Promise<CandidateMatch[]> {
    // Tokenize job description
    const jobTokens = tokenizer.tokenize(jobDescription);
    const jobVector = this.buildJobVector(jobTokens);
    
    // Extract job skills
    const jobSkills = skillExtractor.extractSkills(jobDescription);
    const allJobSkills = [...jobSkills.technical, ...jobSkills.soft];
    
    // Get candidate pool (users with resumes)
    const candidates = await this.getCandidatePool(limit * 10);
    
    // Score and rank candidates
    const scoredCandidates = await this.scoreCandidates(
      candidates, 
      jobVector, 
      jobTitle, 
      jobLocation, 
      allJobSkills
    );
    
    // Sort by match score and limit
    return scoredCandidates
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, limit);
  }

  /**
   * Get candidate pool (users with resumes)
   */
  private async getCandidatePool(limit: number): Promise<{user_id: string, resume_text: string}[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT user_id, resume_text
      FROM user_resumes
      WHERE resume_text IS NOT NULL
      LIMIT ?
    `);
    
    return stmt.all(limit) as {user_id: string, resume_text: string}[];
  }

  /**
   * Score candidates for job matching
   */
  private async scoreCandidates(
    candidates: {user_id: string, resume_text: string}[],
    jobVector: {[token: string]: number},
    jobTitle: string,
    jobLocation: string,
    jobSkills: string[]
  ): Promise<CandidateMatch[]> {
    const scoredCandidates: CandidateMatch[] = [];
    
    for (const candidate of candidates) {
      try {
        // Build candidate interest vector
        const candidateVector = await userInterestEngine.buildInterestVector(
          candidate.user_id, 
          candidate.resume_text
        );
        
        // Calculate skill overlap
        const skillOverlapScore = this.calculateSkillOverlap(
          candidate.resume_text, 
          jobSkills
        );
        
        // Calculate experience alignment
        const experienceAlignmentScore = this.calculateExperienceAlignment(
          candidate.resume_text,
          jobTitle
        );
        
        // Calculate title similarity
        const titleSimilarityScore = this.calculateTitleSimilarity(
          candidate.resume_text,
          jobTitle
        );
        
        // Calculate location match
        const locationMatchScore = await this.calculateLocationMatch(
          candidate.user_id,
          jobLocation
        );
        
        // Calculate activity recency
        const activityRecencyScore = await this.calculateActivityRecency(candidate.user_id);
        
        // Apply recruiter matching formula
        const matchScore = (
          (skillOverlapScore * 0.5) +
          (experienceAlignmentScore * 0.2) +
          (titleSimilarityScore * 0.15) +
          (locationMatchScore * 0.1) +
          (activityRecencyScore * 0.05)
        );
        
        // Get candidate info
        const candidateInfo = await this.getCandidateInfo(candidate.user_id);
        
        // Generate explanation
        const explanation = this.generateExplanation({
          skillOverlapScore,
          experienceAlignmentScore,
          titleSimilarityScore,
          locationMatchScore,
          activityRecencyScore
        });
        
        scoredCandidates.push({
          user_id: candidate.user_id,
          match_score: parseFloat(matchScore.toFixed(4)),
          score_breakdown: {
            skill_overlap: parseFloat(skillOverlapScore.toFixed(4)),
            experience_alignment: parseFloat(experienceAlignmentScore.toFixed(4)),
            title_similarity: parseFloat(titleSimilarityScore.toFixed(4)),
            location_match: parseFloat(locationMatchScore.toFixed(4)),
            activity_recency: parseFloat(activityRecencyScore.toFixed(4))
          },
          explanation,
          candidate_info: candidateInfo
        });
      } catch (error) {
        console.error(`Error scoring candidate ${candidate.user_id}:`, error);
      }
    }
    
    return scoredCandidates;
  }

  /**
   * Build job vector from tokens
   */
  private buildJobVector(tokens: string[]): {[token: string]: number} {
    const vector: {[token: string]: number} = {};
    const totalTokens = tokens.length;
    
    tokens.forEach(token => {
      vector[token] = (vector[token] || 0) + 1;
    });
    
    // Normalize weights
    Object.keys(vector).forEach(token => {
      vector[token] = vector[token] / totalTokens;
    });
    
    return vector;
  }

  /**
   * Calculate skill overlap between candidate and job
   */
  private calculateSkillOverlap(resumeText: string, jobSkills: string[]): number {
    const candidateSkills = skillExtractor.extractSkills(resumeText);
    const allCandidateSkills = [...candidateSkills.technical, ...candidateSkills.soft];
    const candidateSkillSet = new Set(allCandidateSkills.map(s => s.toLowerCase()));
    
    // Count matching skills
    let matchingSkills = 0;
    for (const skill of jobSkills) {
      if (candidateSkillSet.has(skill.toLowerCase())) {
        matchingSkills++;
      }
    }
    
    // Return ratio of matching skills to job skills
    return jobSkills.length > 0 ? matchingSkills / jobSkills.length : 0;
  }

  /**
   * Calculate experience alignment
   */
  private calculateExperienceAlignment(resumeText: string, jobTitle: string): number {
    // Extract experience sections
    const experienceRegex = /experience[:\s]*([\s\S]*?)(?=\n\n|[A-Z][a-z]*\s*(?:Experience|Education|Skills|Projects))/i;
    const experienceMatch = resumeText.match(experienceRegex);
    const experienceText = experienceMatch ? experienceMatch[1] : resumeText;
    
    // Tokenize experience text
    const experienceTokens = new Set(tokenizer.tokenize(experienceText));
    const jobTitleTokens = new Set(tokenizer.tokenize(jobTitle));
    
    // Count matching tokens
    let matches = 0;
    for (const token of jobTitleTokens) {
      if (experienceTokens.has(token)) {
        matches++;
      }
    }
    
    // Return ratio of matching tokens to job title tokens
    return jobTitleTokens.size > 0 ? matches / jobTitleTokens.size : 0;
  }

  /**
   * Calculate title similarity
   */
  private calculateTitleSimilarity(resumeText: string, jobTitle: string): number {
    // Extract current/past job titles from resume
    const titleRegex = /(title|position)[:\s]*([^\n]+)/gi;
    const titles: string[] = [];
    let match;
    
    while ((match = titleRegex.exec(resumeText)) !== null) {
      titles.push(match[2]);
    }
    
    // If no explicit titles found, use first lines that might be titles
    if (titles.length === 0) {
      const lines = resumeText.split('\n').slice(0, 10);
      titles.push(...lines.slice(0, 3)); // First 3 lines
    }
    
    // Tokenize job title
    const jobTitleTokens = new Set(tokenizer.tokenize(jobTitle));
    
    // Calculate maximum similarity across all candidate titles
    let maxSimilarity = 0;
    for (const title of titles) {
      const titleTokens = new Set(tokenizer.tokenize(title));
      let matches = 0;
      
      for (const token of jobTitleTokens) {
        if (titleTokens.has(token)) {
          matches++;
        }
      }
      
      const similarity = jobTitleTokens.size > 0 ? matches / jobTitleTokens.size : 0;
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  /**
   * Calculate location match
   */
  private async calculateLocationMatch(userId: string, jobLocation: string): Promise<number> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT preferred_location FROM user_profiles WHERE user_id = ?
    `);
    
    const result = stmt.get(userId) as { preferred_location?: string };
    const userLocation = result?.preferred_location;
    
    if (!userLocation) return 0.5; // Neutral score if no preference
    
    // Exact match
    if (userLocation.toLowerCase().includes(jobLocation.toLowerCase())) {
      return 1;
    }
    
    // Partial match
    const userLocationTokens = userLocation.toLowerCase().split(/\s+/);
    const jobLocationTokens = jobLocation.toLowerCase().split(/\s+/);
    
    let matchCount = 0;
    for (const userToken of userLocationTokens) {
      if (jobLocationTokens.some(jobToken => jobToken.includes(userToken))) {
        matchCount++;
      }
    }
    
    return matchCount / userLocationTokens.length;
  }

  /**
   * Calculate activity recency (recently active users get higher scores)
   */
  private async calculateActivityRecency(userId: string): Promise<number> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT MAX(timestamp) as last_activity
      FROM user_interactions
      WHERE user_id = ?
    `);
    
    const result = stmt.get(userId) as { last_activity?: number };
    const lastActivity = result?.last_activity;
    
    if (!lastActivity) return 0.5; // Neutral score if no activity
    
    const secondsSinceActivity = Date.now()/1000 - lastActivity;
    const daysSinceActivity = secondsSinceActivity / (24 * 60 * 60);
    
    // Users active in last 30 days get higher scores
    if (daysSinceActivity <= 30) {
      return 1 - (daysSinceActivity / 30);
    }
    
    return 0;
  }

  /**
   * Get candidate information
   */
  private async getCandidateInfo(userId: string): Promise<{
    name: string;
    email: string;
    resume_preview: string;
    skills: string[];
  }> {
    const db = dbManager.getDB();
    
    // Get user info
    const userStmt = db.prepare(`
      SELECT name, email FROM users WHERE id = ?
    `);
    const userInfo = userStmt.get(userId) as { name: string; email: string };
    
    // Get resume preview (first 200 characters)
    const resumeStmt = db.prepare(`
      SELECT SUBSTR(resume_text, 1, 200) || '...' as resume_preview
      FROM user_resumes WHERE user_id = ?
    `);
    const resumeResult = resumeStmt.get(userId) as { resume_preview: string };
    
    // Get skills
    const skillsStmt = db.prepare(`
      SELECT resume_text FROM user_resumes WHERE user_id = ?
    `);
    const skillsResult = skillsStmt.get(userId) as { resume_text: string };
    const skills = skillsResult?.resume_text 
      ? skillExtractor.extractSkills(skillsResult.resume_text).technical 
      : [];
    
    return {
      name: userInfo?.name || 'Unknown',
      email: userInfo?.email || 'N/A',
      resume_preview: resumeResult?.resume_preview || 'No resume available',
      skills
    };
  }

  /**
   * Generate explanation for matching scores
   */
  private generateExplanation(scores: {
    skillOverlapScore: number;
    experienceAlignmentScore: number;
    titleSimilarityScore: number;
    locationMatchScore: number;
    activityRecencyScore: number;
  }): string[] {
    const explanations: string[] = [];
    
    if (scores.skillOverlapScore > 0.5) {
      explanations.push('Strong skill overlap with job requirements');
    }
    
    if (scores.experienceAlignmentScore > 0.5) {
      explanations.push('Experience aligns well with job description');
    }
    
    if (scores.titleSimilarityScore > 0.5) {
      explanations.push('Current/past roles match job title');
    }
    
    if (scores.locationMatchScore > 0.7) {
      explanations.push('Location preference matches job location');
    }
    
    if (scores.activityRecencyScore > 0.7) {
      explanations.push('Recently active on the platform');
    }
    
    if (explanations.length === 0) {
      explanations.push('Moderate match based on available information');
    }
    
    return explanations;
  }
}

export const recruiterMatchingService = new RecruiterMatchingService();