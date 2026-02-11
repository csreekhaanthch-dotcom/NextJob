import { dbManager } from '../database/connection';
import { userInterestEngine } from '../core/userInterestEngine';
import { Job } from '../core/types';
import { LRUCache } from 'lru-cache';

interface PersonalizedJob extends Job {
  personalization_score: number;
  score_breakdown: {
    resume_match: number;
    behavior_similarity: number;
    skill_alignment: number;
    location_score: number;
    freshness: number;
  };
  explanation: string[];
}

class PersonalizationService {
  private feedCache: LRUCache<string, PersonalizedJob[]>;

  constructor() {
    // Cache personalized feeds
    this.feedCache = new LRUCache<string, PersonalizedJob[]>({
      max: 1000,
      ttl: 1000 * 60 * 10 // 10 minutes
    });
  }

  /**
   * Get personalized job feed for user
   */
  async getPersonalizedFeed(
    userId: string, 
    resumeText?: string,
    location?: string,
    limit: number = 50
  ): Promise<PersonalizedJob[]> {
    // Check cache first
    const cacheKey = `${userId}_${location || 'any'}_${limit}`;
    const cachedFeed = this.feedCache.get(cacheKey);
    if (cachedFeed) {
      return cachedFeed;
    }
    
    // Build user interest vector
    const interestVector = await userInterestEngine.buildInterestVector(userId, resumeText);
    
    // Get candidate jobs (top 1000 by ranking score)
    const candidateJobs = await this.getCandidateJobs(limit * 20);
    
    // Score and rank jobs
    const scoredJobs = await this.scoreJobs(candidateJobs, userId, interestVector, location);
    
    // Sort by personalization score and limit
    const personalizedFeed = scoredJobs
      .sort((a, b) => b.personalization_score - a.personalization_score)
      .slice(0, limit);
    
    // Cache result
    this.feedCache.set(cacheKey, personalizedFeed);
    
    return personalizedFeed;
  }

  /**
   * Get candidate jobs for personalization (top 1000 by ranking score)
   */
  private async getCandidateJobs(limit: number = 1000): Promise<Job[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT * FROM jobs 
      ORDER BY ranking_score DESC, posted_date DESC
      LIMIT ?
    `);
    
    return stmt.all(limit) as Job[];
  }

  /**
   * Score jobs for personalization
   */
  private async scoreJobs(
    jobs: Job[], 
    userId: string, 
    interestVector: {[token: string]: number}, 
    userLocation?: string
  ): Promise<PersonalizedJob[]> {
    const scoredJobs: PersonalizedJob[] = [];
    
    for (const job of jobs) {
      try {
        // Get job tokens
        const jobTokens = await this.getJobTokens(job.id);
        
        // Calculate resume match score (similarity between interest vector and job tokens)
        const resumeMatchScore = userInterestEngine.calculateSimilarity(
          interestVector, 
          jobTokens
        );
        
        // Calculate behavior similarity (based on similar users)
        const behaviorSimilarityScore = await this.calculateBehaviorSimilarity(userId, job.id);
        
        // Calculate skill alignment
        const skillAlignmentScore = this.calculateSkillAlignment(interestVector, jobTokens);
        
        // Calculate location score
        const locationScore = this.calculateLocationScore(job.location, userLocation);
        
        // Calculate freshness (newer jobs get higher scores)
        const freshnessScore = this.calculateFreshness(job.posted_date);
        
        // Apply personalization formula
        const personalizationScore = (
          (resumeMatchScore * 0.4) +
          (behaviorSimilarityScore * 0.3) +
          (skillAlignmentScore * 0.15) +
          (locationScore * 0.1) +
          (freshnessScore * 0.05)
        );
        
        // Generate explanation
        const explanation = this.generateExplanation({
          resumeMatchScore,
          behaviorSimilarityScore,
          skillAlignmentScore,
          locationScore,
          freshnessScore
        });
        
        scoredJobs.push({
          ...job,
          personalization_score: parseFloat(personalizationScore.toFixed(4)),
          score_breakdown: {
            resume_match: parseFloat(resumeMatchScore.toFixed(4)),
            behavior_similarity: parseFloat(behaviorSimilarityScore.toFixed(4)),
            skill_alignment: parseFloat(skillAlignmentScore.toFixed(4)),
            location_score: parseFloat(locationScore.toFixed(4)),
            freshness: parseFloat(freshnessScore.toFixed(4))
          },
          explanation
        });
      } catch (error) {
        console.error(`Error scoring job ${job.id}:`, error);
      }
    }
    
    return scoredJobs;
  }

  /**
   * Get job tokens
   */
  private async getJobTokens(jobId: string): Promise<{[token: string]: number}> {
    const db = dbManager.getDB();
    const stmt = db.prepare('SELECT token, weight FROM job_tokens WHERE job_id = ?');
    const tokens = stmt.all(jobId) as { token: string; weight: number }[];
    
    const tokenMap: {[token: string]: number} = {};
    tokens.forEach(({ token, weight }) => {
      tokenMap[token] = weight;
    });
    
    return tokenMap;
  }

  /**
   * Calculate behavior similarity based on similar users
   */
  private async calculateBehaviorSimilarity(userId: string, jobId: string): Promise<number> {
    // For now, we'll use a simplified approach
    // In a full implementation, this would compare the user's behavior
    // with other users who interacted with the same job
    
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT COUNT(*) as similar_users
      FROM user_interactions ui1
      INNER JOIN user_interactions ui2 ON ui1.job_id = ui2.job_id
      WHERE ui1.user_id = ? AND ui2.job_id = ?
    `);
    
    const result = stmt.get(userId, jobId) as { similar_users: number };
    return Math.min(result.similar_users / 10, 1); // Normalize to 0-1 range
  }

  /**
   * Calculate skill alignment between user interests and job requirements
   */
  private calculateSkillAlignment(
    interestVector: {[token: string]: number}, 
    jobTokens: {[token: string]: number}
  ): number {
    // Count overlapping skills
    let overlapCount = 0;
    const interestTokens = new Set(Object.keys(interestVector));
    const jobTokenSet = new Set(Object.keys(jobTokens));
    
    for (const token of interestTokens) {
      if (jobTokenSet.has(token)) {
        overlapCount++;
      }
    }
    
    // Return ratio of overlapping skills to total interest tokens
    return interestTokens.size > 0 ? overlapCount / interestTokens.size : 0;
  }

  /**
   * Calculate location score
   */
  private calculateLocationScore(jobLocation: string, userLocation?: string): number {
    if (!userLocation) return 0.5; // Neutral score if no preference
    
    // Exact match
    if (jobLocation.toLowerCase().includes(userLocation.toLowerCase())) {
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
   * Calculate freshness score (newer jobs get higher scores)
   */
  private calculateFreshness(postedDate: number): number {
    const now = Math.floor(Date.now() / 1000);
    const secondsSincePosted = now - postedDate;
    const daysSincePosted = secondsSincePosted / (24 * 60 * 60);
    
    // Jobs posted in last 7 days get highest score
    if (daysSincePosted <= 7) {
      return 1;
    }
    
    // Linear decay for older jobs (0 score after 60 days)
    if (daysSincePosted <= 60) {
      return 1 - (daysSincePosted - 7) / 53;
    }
    
    return 0;
  }

  /**
   * Generate explanation for scoring
   */
  private generateExplanation(scores: {
    resumeMatchScore: number;
    behaviorSimilarityScore: number;
    skillAlignmentScore: number;
    locationScore: number;
    freshnessScore: number;
  }): string[] {
    const explanations: string[] = [];
    
    if (scores.resumeMatchScore > 0.3) {
      explanations.push('High match with your resume and interests');
    }
    
    if (scores.behaviorSimilarityScore > 0.5) {
      explanations.push('Popular with users who share your interests');
    }
    
    if (scores.skillAlignmentScore > 0.5) {
      explanations.push('Strong alignment with your skills');
    }
    
    if (scores.locationScore > 0.7) {
      explanations.push('Located near your preferred area');
    }
    
    if (scores.freshnessScore > 0.8) {
      explanations.push('Recently posted job');
    }
    
    if (explanations.length === 0) {
      explanations.push('Match based on general relevance');
    }
    
    return explanations;
  }
}

export const personalizationService = new PersonalizationService();