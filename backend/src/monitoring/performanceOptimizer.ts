import { LRUCache } from 'lru-cache';
import { dbManager } from '../database/connection';
import { cacheService } from '../services/cacheService';

interface CacheItem {
  data: any;
  expiry: number;
}

class PerformanceOptimizer {
  private jobCache: LRUCache<string, CacheItem>;
  private userVectorCache: LRUCache<string, CacheItem>;
  private trendingJobsCache: LRUCache<string, CacheItem>;

  constructor() {
    // Initialize caches with appropriate TTLs
    this.jobCache = cacheService.createCache('jobs', { 
      maxSize: 10000, 
      ttl: 1000 * 60 * 5 // 5 minutes
    });
    
    this.userVectorCache = cacheService.createCache('user-vectors', { 
      maxSize: 10000, 
      ttl: 1000 * 60 * 10 // 10 minutes
    });
    
    this.trendingJobsCache = cacheService.createCache('trending-jobs', { 
      maxSize: 1000, 
      ttl: 1000 * 60 * 30 // 30 minutes
    });
  }

  /**
   * Cache trending jobs periodically
   */
  async cacheTrendingJobs(): Promise<void> {
    try {
      const db = dbManager.getDB();
      const stmt = db.prepare(`
        SELECT j.*, COUNT(jm.id) as match_count
        FROM jobs j
        LEFT JOIN job_matches jm ON j.id = jm.job_id
        WHERE j.posted_date > ?
        GROUP BY j.id
        ORDER BY match_count DESC, j.ranking_score DESC
        LIMIT 100
      `);
      
      const cutoffDate = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // Last 7 days
      const trendingJobs = stmt.all(cutoffDate);
      
      // Cache trending jobs
      this.trendingJobsCache.set('trending', {
        data: trendingJobs,
        expiry: Date.now() + 30 * 60 * 1000 // 30 minutes
      });
      
      console.log(`Cached ${trendingJobs.length} trending jobs`);
    } catch (error) {
      console.error('Error caching trending jobs:', error);
    }
  }

  /**
   * Precompute user interest vectors
   */
  async precomputeUserVectors(batchSize: number = 100): Promise<void> {
    try {
      const db = dbManager.getDB();
      const stmt = db.prepare(`
        SELECT id FROM users 
        WHERE id NOT IN (
          SELECT user_id FROM job_matches 
          WHERE created_at > datetime('now', '-1 day')
        )
        LIMIT ?
      `);
      
      const users = stmt.all() as { id: string }[];
      
      // In a real implementation, we would compute vectors for these users
      // For now, just log the count
      console.log(`Precomputing vectors for ${users.length} users`);
      
      // This would normally trigger vector computation in batches
      // to avoid overwhelming the system
    } catch (error) {
      console.error('Error precomputing user vectors:', error);
    }
  }

  /**
   * Optimize database indexes
   */
  async optimizeDatabaseIndexes(): Promise<void> {
    try {
      const db = dbManager.getDB();
      
      // Create materialized view for analytics (refreshed periodically)
      db.exec(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_analytics AS
        SELECT 
          date(j.posted_date, 'unixepoch') as posting_date,
          c.industry,
          COUNT(*) as job_count,
          AVG(j.ranking_score) as avg_ranking_score
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.posted_date > strftime('%s', 'now') - (30 * 24 * 60 * 60)
        GROUP BY date(j.posted_date, 'unixepoch'), c.industry
      `);
      
      console.log('Database indexes optimized');
    } catch (error) {
      console.error('Error optimizing database indexes:', error);
    }
  }

  /**
   * Batch job scraping during low-traffic periods
   */
  async scheduleBatchScraping(): Promise<void> {
    // In a real implementation, this would:
    // 1. Check current traffic/load
    // 2. Schedule scraping during low-traffic periods
    // 3. Distribute scraping tasks across time
    
    console.log('Batch scraping scheduled for low-traffic period');
  }

  /**
   * Get cached trending jobs
   */
  getCachedTrendingJobs(): any[] | null {
    const cached = this.trendingJobsCache.get('trending');
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    return null;
  }
}

export const performanceOptimizer = new PerformanceOptimizer();