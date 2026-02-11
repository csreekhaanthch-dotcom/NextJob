import { dbManager } from '../database/connection';
import { tokenizer } from './tokenizer';
import { cacheService } from '../services/cacheService';

interface UserBehavior {
  job_id: string;
  view_count: number;
  click_count: number;
  save_count: number;
  apply_count: number;
  last_interaction: number; // timestamp
}

interface InterestVector {
  [token: string]: number;
}

class UserInterestEngine {
  private behaviorCache;
  private interestCache;

  constructor() {
    // Initialize caches
    this.behaviorCache = cacheService.createCache('user-behavior', { 
      maxSize: 10000, 
      ttl: 1000 * 60 * 5 // 5 minutes
    });
    
    this.interestCache = cacheService.createCache('user-interest', { 
      maxSize: 10000, 
      ttl: 1000 * 60 * 10 // 10 minutes
    });
  }

  /**
   * Record user interaction with a job
   */
  async recordInteraction(userId: string, jobId: string, interactionType: string): Promise<void> {
    const db = dbManager.getDB();
    
    // Insert or update interaction record
    const stmt = db.prepare(`
      INSERT INTO user_behavior (user_id, job_id, action_type, timestamp)
      VALUES (?, ?, ?, strftime('%s', 'now'))
      ON CONFLICT(user_id, job_id, action_type) DO UPDATE SET
        timestamp = strftime('%s', 'now')
    `);
    
    stmt.run(userId, jobId, interactionType);
    
    // Invalidate caches
    this.behaviorCache.delete(userId);
    this.interestCache.delete(userId);
  }

  /**
   * Build user interest vector from resume and behavior
   */
  async buildInterestVector(userId: string, resumeText?: string): Promise<InterestVector> {
    // Check cache first
    const cachedVector = this.interestCache.get(userId);
    if (cachedVector) {
      return cachedVector;
    }
    
    const vector: InterestVector = {};
    
    // Add resume-based interests
    if (resumeText) {
      const resumeTokens = tokenizer.tokenize(resumeText);
      const resumeWeights = this.calculateTokenWeights(resumeTokens);
      
      // Boost resume tokens
      Object.entries(resumeWeights).forEach(([token, weight]) => {
        vector[token] = (vector[token] || 0) + weight * 2; // 2x boost for resume tokens
      });
    }
    
    // Add behavior-based interests
    const behaviors = await this.getUserBehaviors(userId);
    const behaviorVector = await this.buildBehaviorVector(behaviors);
    
    // Combine vectors
    Object.entries(behaviorVector).forEach(([token, weight]) => {
      vector[token] = (vector[token] || 0) + weight;
    });
    
    // Normalize vector
    const normalizedVector = this.normalizeVector(vector);
    
    // Cache result
    this.interestCache.set(userId, normalizedVector);
    
    return normalizedVector;
  }

  /**
   * Get user behaviors from database
   */
  private async getUserBehaviors(userId: string): Promise<UserBehavior[]> {
    // Check cache first
    const cachedBehaviors = this.behaviorCache.get(userId);
    if (cachedBehaviors) {
      return cachedBehaviors;
    }
    
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT 
        job_id,
        SUM(CASE WHEN action_type = 'view' THEN 1 ELSE 0 END) as view_count,
        SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END) as click_count,
        SUM(CASE WHEN action_type = 'save' THEN 1 ELSE 0 END) as save_count,
        SUM(CASE WHEN action_type = 'apply' THEN 1 ELSE 0 END) as apply_count,
        MAX(timestamp) as last_interaction
      FROM user_behavior
      WHERE user_id = ?
      GROUP BY job_id
    `);
    
    const behaviors = stmt.all(userId) as UserBehavior[];
    
    // Cache result
    this.behaviorCache.set(userId, behaviors);
    
    return behaviors;
  }

  /**
   * Build behavior vector from user interactions
   */
  private async buildBehaviorVector(behaviors: UserBehavior[]): Promise<InterestVector> {
    const vector: InterestVector = {};
    
    for (const behavior of behaviors) {
      // Get job tokens
      const jobTokens = await this.getJobTokens(behavior.job_id);
      
      // Weight tokens by interaction strength
      const interactionScore = 
        behavior.view_count * 1 +
        behavior.click_count * 3 +
        behavior.save_count * 5 +
        behavior.apply_count * 10;
      
      // Apply recency decay (half-life of 30 days)
      const secondsSinceInteraction = Date.now()/1000 - behavior.last_interaction;
      const daysSinceInteraction = secondsSinceInteraction / (24 * 60 * 60);
      const recencyFactor = Math.pow(0.5, daysSinceInteraction / 30);
      
      const weightedScore = interactionScore * recencyFactor;
      
      // Add weighted tokens to vector
      Object.entries(jobTokens).forEach(([token, weight]) => {
        vector[token] = (vector[token] || 0) + weight * weightedScore;
      });
    }
    
    return vector;
  }

  /**
   * Get tokens for a specific job
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
   * Calculate token weights from token array
   */
  private calculateTokenWeights(tokens: string[]): {[token: string]: number} {
    const weights: {[token: string]: number} = {};
    const totalTokens = tokens.length;
    
    tokens.forEach(token => {
      weights[token] = (weights[token] || 0) + 1;
    });
    
    // Normalize weights
    Object.keys(weights).forEach(token => {
      weights[token] = weights[token] / totalTokens;
    });
    
    return weights;
  }

  /**
   * Normalize vector values
   */
  private normalizeVector(vector: InterestVector): InterestVector {
    const magnitude = Math.sqrt(
      Object.values(vector).reduce((sum, val) => sum + val * val, 0)
    );
    
    if (magnitude === 0) return vector;
    
    const normalized: InterestVector = {};
    Object.entries(vector).forEach(([token, weight]) => {
      normalized[token] = weight / magnitude;
    });
    
    return normalized;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateSimilarity(vectorA: InterestVector, vectorB: InterestVector): number {
    // Get all unique tokens
    const allTokens = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
    
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (const token of allTokens) {
      const a = vectorA[token] || 0;
      const b = vectorB[token] || 0;
      dotProduct += a * b;
      magnitudeA += a * a;
      magnitudeB += b * b;
    }
    
    // Calculate cosine similarity
    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

export const userInterestEngine = new UserInterestEngine();