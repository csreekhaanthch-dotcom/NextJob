import { supabaseManager } from '../database/supabaseConnection';
import { SearchParams, SearchResult, Job } from '../core/types';
import { LRUCache } from 'lru-cache';

class SearchServiceSupabase {
  private cache: LRUCache<string, SearchResult>;

  constructor() {
    // Initialize LRU cache with 1000 entries, 5 minute TTL
    this.cache = new LRUCache<string, SearchResult>({
      max: 1000,
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }

  async search(params: SearchParams): Promise<SearchResult> {
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

  private async performSearch(params: SearchParams): Promise<SearchResult> {
    const {
      keyword = '',
      location = '',
      remote = undefined,
      page = 1,
      limit = 20
    } = params;
    
    const offset = (page - 1) * limit;
    const supabase = supabaseManager.getClient();
    
    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('ranking_score', { ascending: false })
      .order('posted_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add keyword search using tokens (Supabase doesn't support JOIN in the same way as SQLite)
    if (keyword) {
      const keywords = keyword.toLowerCase().split(/\s+/);
      // For Supabase, we'll search in multiple text fields
      query = query.or(keywords.map(kw => `title_normalized.ilike.%${kw}%`).join(','));
      query = query.or(keywords.map(kw => `description.ilike.%${kw}%`).join(','));
    }
    
    // Add location filter
    if (location) {
      const locationLower = location.toLowerCase();
      query = query.or(`location_normalized.ilike.%${locationLower}%,company_domain.ilike.%${locationLower}%`);
    }
    
    // Add remote filter
    if (remote !== undefined) {
      query = query.eq('remote', remote);
    }
    
    const { data: jobs, error, count } = await query;
    
    if (error) {
      console.error('Search error:', error.message);
      return {
        jobs: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
    
    return {
      jobs: jobs || [],
      total: count || 0,
      page,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  }

  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0, // LRU cache doesn't expose hits/misses directly
      misses: 0
    };
  }
}

export const searchServiceSupabase = new SearchServiceSupabase();