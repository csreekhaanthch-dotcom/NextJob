import { dbManager } from '../database/connection';
import { DailyStats, CompanyActivity, TrendingSkill, LocationGrowth } from '../core/types';

class AnalyticsService {
  /**
   * Generate daily stats for trending analysis
   */
  async generateDailyStats(): Promise<void> {
    const db = dbManager.getDB();
    const today = new Date().toISOString().split('T')[0];
    
    // Clear today's stats
    const clearStmt = db.prepare('DELETE FROM daily_stats WHERE date = ?');
    clearStmt.run(today);
    
    // Generate new stats from job tokens
    const generateStmt = db.prepare(`
      INSERT INTO daily_stats (date, token, job_count)
      SELECT ?, jt.token, COUNT(DISTINCT jt.job_id) as job_count
      FROM job_tokens jt
      INNER JOIN jobs j ON jt.job_id = j.id
      WHERE DATE(j.posted_date, 'unixepoch') = ?
      GROUP BY jt.token
    `);
    
    generateStmt.run(today, today);
  }

  /**
   * Get trending skills from last 7 days
   */
  async getTrendingSkills(days: number = 7): Promise<TrendingSkill[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT 
        ds.token,
        SUM(ds.job_count) as count,
        CASE 
          WHEN prev.count > 0 THEN ((ds.job_count - prev.count) * 100.0 / prev.count)
          ELSE 100
        END as growth_rate
      FROM daily_stats ds
      LEFT JOIN (
        SELECT token, SUM(job_count) as count
        FROM daily_stats
        WHERE date >= DATE('now', '-${days * 2} days') AND date < DATE('now', '-${days} days')
        GROUP BY token
      ) prev ON ds.token = prev.token
      WHERE ds.date >= DATE('now', '-${days} days')
      GROUP BY ds.token
      ORDER BY count DESC
      LIMIT 20
    `);
    
    return stmt.all() as TrendingSkill[];
  }

  /**
   * Get remote vs onsite ratio
   */
  async getRemoteRatio(): Promise<{ remote: number; onsite: number; ratio: number }> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT 
        SUM(CASE WHEN remote = 1 THEN 1 ELSE 0 END) as remote_count,
        SUM(CASE WHEN remote = 0 THEN 1 ELSE 0 END) as onsite_count
      FROM jobs
      WHERE posted_date > ?
    `);
    
    // Last 30 days
    const cutoffDate = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const result = stmt.get(cutoffDate) as { remote_count: number; onsite_count: number };
    
    const total = result.remote_count + result.onsite_count;
    const ratio = total > 0 ? result.remote_count / total : 0;
    
    return {
      remote: result.remote_count,
      onsite: result.onsite_count,
      ratio
    };
  }

  /**
   * Get most active hiring companies
   */
  async getTopCompanies(limit: number = 20): Promise<CompanyActivity[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT company_domain, COUNT(*) as job_count
      FROM jobs
      WHERE posted_date > ?
      GROUP BY company_domain
      ORDER BY job_count DESC
      LIMIT ?
    `);
    
    // Last 90 days
    const cutoffDate = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
    return stmt.all(cutoffDate, limit) as CompanyActivity[];
  }

  /**
   * Get location growth statistics
   */
  async getLocationGrowth(): Promise<LocationGrowth[]> {
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      SELECT 
        location,
        COUNT(*) as job_count,
        CASE 
          WHEN prev.count > 0 THEN ((COUNT(*) - prev.count) * 100.0 / prev.count)
          ELSE 100
        END as growth_percentage
      FROM jobs j
      LEFT JOIN (
        SELECT location, COUNT(*) as count
        FROM jobs
        WHERE posted_date < ?
        GROUP BY location
      ) prev ON j.location = prev.location
      WHERE j.posted_date > ?
      GROUP BY location
      ORDER BY job_count DESC
      LIMIT 20
    `);
    
    // Compare last 30 days to previous 30 days
    const cutoffDate = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const prevCutoffDate = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
    
    return stmt.all(prevCutoffDate, cutoffDate) as LocationGrowth[];
  }

  /**
   * Initialize analytics tables with historical data
   */
  async initializeHistoricalData(): Promise<void> {
    const db = dbManager.getDB();
    
    // Generate daily stats for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const stmt = db.prepare(`
        INSERT INTO daily_stats (date, token, job_count)
        SELECT ?, jt.token, COUNT(DISTINCT jt.job_id) as job_count
        FROM job_tokens jt
        INNER JOIN jobs j ON jt.job_id = j.id
        WHERE DATE(j.posted_date, 'unixepoch') = ?
        GROUP BY jt.token
      `);
      
      stmt.run(dateString, dateString);
    }
  }
}

export const analyticsService = new AnalyticsService();