import { dbManager } from '../database/connection';
import { SearchParams, SearchResult, Job } from '../core/types';
import { LRUCache } from 'lru-cache';
import { searchServiceSupabase } from './searchService.supabase';

class SearchService {
  private cache: LRUCache<string, SearchResult>;

  constructor() {
    // Initialize LRU cache with 1000 entries, 5 minute TTL
    this.cache = new LRUCache<string, SearchResult>({
      max: 1000,
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }

  /**
   * Search jobs with caching
   */
  async search(params: SearchParams): Promise<SearchResult> {
    if (dbManager.isUsingSupabase()) {
      return searchServiceSupabase.search(params);
    }
    
    // Create cache key
    const cacheKey = JSON.stringify(params);
    const cachedResult = this.cache.get(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }
    
    const result = await this.performSearch(params);
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Perform actual search
   */
  private async performSearch(params: SearchParams): Promise<SearchResult> {
    const {
      keyword = '',
      location = '',
      remote = undefined,
      page = 1,
      limit = 20
    } = params;
    
    const offset = (page - 1) * limit;
    
    // Build dynamic query based on parameters
    let query = `
      SELECT DISTINCT j.* 
      FROM jobs j
    `;
    
    const conditions: string[] = [];
    const queryParams: any[] = [];
    
    // Add keyword search using tokens
    if (keyword) {
      query += `
        INNER JOIN job_tokens jt ON j.id = jt.job_id
      `;
      conditions.push('jt.token IN (' + keyword.toLowerCase().split(/\s+/).map(() => '?').join(',') + ')');
      queryParams.push(...keyword.toLowerCase().split(/\s+/));
    }
    
    // Add location filter
    if (location) {
      conditions.push('(j.location_normalized LIKE ? OR j.company_domain LIKE ?)');
      queryParams.push(`%${location.toLowerCase()}%`, `%${location.toLowerCase()}%`);
    }
    
    // Add remote filter
    if (remote !== undefined) {
      conditions.push('j.remote = ?');
      queryParams.push(remote ? 1 : 0);
    }
    
    // Add conditions to query
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add ordering and pagination
    query += `
      ORDER BY j.ranking_score DESC, j.posted_date DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    // Execute query
    const db = dbManager.getDB();
    const stmt = db.prepare(query);
    const jobs = stmt.all(...queryParams) as Job[];
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT j.id) as total
      FROM jobs j
    `;
    
    if (keyword) {
      countQuery += `
        INNER JOIN job_tokens jt ON j.id = jt.job_id
      `;
    }
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...queryParams.slice(0, -2)) as { total: number };
    const total = countResult.total;
    
    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Clear cache for specific key or all
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // LRU cache doesn't expose hits/misses directly
      misses: 0
    };
  }
}

export const searchService = new SearchService();