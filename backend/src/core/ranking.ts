import { Job } from './types';
import { dbManager } from '../database/connection';
import { supabaseManager } from '../database/supabaseConnection';

class RankingEngine {
  /**
   * Calculate freshness score based on days since posting
   * Freshness score = 1 / (days_since_posted + 1)
   */
  calculateFreshnessScore(postedDate: number): number {
    const now = Math.floor(Date.now() / 1000);
    const daysSincePosted = (now - postedDate) / (24 * 60 * 60);
    return 1 / (daysSincePosted + 1);
  }

  /**
   * Calculate remote bonus
   */
  calculateRemoteBonus(remote: boolean): number {
    return remote ? 1 : 0;
  }

  /**
   * Calculate company activity score based on number of active jobs
   * company_activity_score = log(number_of_active_jobs + 1)
   */
  async calculateCompanyActivityScore(companyDomain: string): Promise<number> {
    if (dbManager.isUsingSupabase()) {
      const supabase = supabaseManager.getClient();
      const cutoffDate = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
      
      const { count, error } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_domain', companyDomain)
        .gt('posted_date', cutoffDate);
      
      if (error) {
        console.error('Error calculating company activity score:', error.message);
        return 0;
      }
      
      const jobCount = count || 0;
      return Math.log(jobCount + 1);
    } else {
      const stmt = dbManager.prepare(`
        SELECT COUNT(*) as job_count 
        FROM jobs 
        WHERE company_domain = ? 
        AND posted_date > ?
      `);
      
      // Consider jobs posted in last 90 days as active
      const cutoffDate = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
      const result = stmt.get(companyDomain, cutoffDate) as { job_count: number };
      
      return Math.log(result.job_count + 1);
    }
  }

  /**
   * Calculate keyword density score from token weights
   */
  calculateKeywordDensityScore(tokenWeights: Record<string, number>): number {
    const totalWeight = Object.values(tokenWeights).reduce((sum, weight) => sum + weight, 0);
    return totalWeight;
  }

  /**
   * Calculate overall ranking score
   * ranking_score = (freshness_score * 0.4) + 
   *                 (keyword_density_score * 0.3) + 
   *                 (remote_bonus * 0.1) + 
   *                 (company_activity_score * 0.2)
   */
  async calculateRankingScore(job: Job, tokenWeights: Record<string, number>): Promise<number> {
    const freshnessScore = this.calculateFreshnessScore(job.posted_date);
    const remoteBonus = this.calculateRemoteBonus(job.remote);
    const keywordDensityScore = this.calculateKeywordDensityScore(tokenWeights);
    const companyActivityScore = await this.calculateCompanyActivityScore(job.company_domain);
    
    const rankingScore = (
      (freshnessScore * 0.4) +
      (keywordDensityScore * 0.3) +
      (remoteBonus * 0.1) +
      (companyActivityScore * 0.2)
    );
    
    return rankingScore;
  }

  /**
   * Update ranking score for a job
   */
  async updateJobRanking(jobId: string, rankingScore: number): Promise<void> {
    if (dbManager.isUsingSupabase()) {
      const supabase = supabaseManager.getClient();
      const { error } = await supabase
        .from('jobs')
        .update({
          ranking_score: rankingScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      
      if (error) {
        console.error('Error updating job ranking:', error.message);
        throw error;
      }
    } else {
      const stmt = dbManager.prepare(`
        UPDATE jobs 
        SET ranking_score = ?, updated_at = strftime('%s', 'now')
        WHERE id = ?
      `);
      
      stmt.run(rankingScore, jobId);
    }
  }
}

export const rankingEngine = new RankingEngine();