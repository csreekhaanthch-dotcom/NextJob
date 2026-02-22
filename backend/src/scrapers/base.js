/**
 * Base Scraper Class
 * Provides common functionality for all scrapers including rate limiting, caching, and error handling
 */

const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'job-scraper' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
  ],
});

// Simple in-memory cache (consider Redis for production)
class SimpleCache {
  constructor(ttl = 3600000) { // Default 1 hour TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, customTTL = null) {
    const ttl = customTTL || this.ttl;
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Rate limiter using token bucket algorithm
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();
    // Remove requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      // Calculate wait time
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer
      logger.info(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForSlot(); // Retry after waiting
    }

    this.requests.push(now);
  }
}

// Base scraper class
class BaseScraper {
  constructor(options = {}) {
    this.name = options.name || 'BaseScraper';
    this.baseUrl = options.baseUrl || '';
    this.userAgent = options.userAgent || 'NextJob-Bot/1.0 (https://github.com/yourrepo; contact@nextjob.com)';
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.cache = new SimpleCache(options.cacheTTL || 3600000); // Default 1 hour
    this.rateLimiter = options.rateLimiter || null;
    this.enabled = options.enabled !== false; // Default enabled
    this.priority = options.priority || 5; // Lower = higher priority (1-10)
  }

  /**
   * Make an HTTP request with error handling and caching
   */
  async fetch(url, options = {}) {
    if (!this.enabled) {
      logger.debug(`${this.name} is disabled, skipping fetch`);
      return null;
    }

    const cacheKey = `${this.name}:${url}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && !options.skipCache) {
      logger.debug(`${this.name}: Cache hit for ${url}`);
      return cached;
    }

    try {
      // Respect rate limiting if configured
      if (this.rateLimiter) {
        await this.rateLimiter.waitForSlot();
      }

      logger.debug(`${this.name}: Fetching ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      this.cache.set(cacheKey, data, options.cacheTTL);
      
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        logger.error(`${this.name}: Request timeout for ${url}`);
      } else {
        logger.error(`${this.name}: Fetch error for ${url}`, error);
      }
      throw error;
    }
  }

  /**
   * Fetch HTML page (for custom scrapers)
   */
  async fetchHTML(url, options = {}) {
    if (!this.enabled) {
      logger.debug(`${this.name} is disabled, skipping fetch`);
      return null;
    }

    const cacheKey = `${this.name}:html:${url}`;
    const cached = this.cache.get(cacheKey);
    if (cached && !options.skipCache) {
      logger.debug(`${this.name}: HTML cache hit for ${url}`);
      return cached;
    }

    try {
      if (this.rateLimiter) {
        await this.rateLimiter.waitForSlot();
      }

      logger.debug(`${this.name}: Fetching HTML ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Cache successful responses
      this.cache.set(cacheKey, html, options.cacheTTL);
      
      return html;
    } catch (error) {
      if (error.name === 'AbortError') {
        logger.error(`${this.name}: HTML request timeout for ${url}`);
      } else {
        logger.error(`${this.name}: HTML fetch error for ${url}`, error);
      }
      throw error;
    }
  }

  /**
   * Check robots.txt for a domain
   */
  async checkRobotsTxt(domain) {
    try {
      const url = `https://${domain}/robots.txt`;
      const html = await this.fetchHTML(url, { skipCache: true });
      
      // Simple check for disallow rules
      const lines = html.split('\n');
      let disallowed = false;
      let userAgentSection = false;

      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        
        if (trimmed.startsWith('user-agent:')) {
          const ua = trimmed.split(':')[1].trim();
          userAgentSection = ua === '*' || ua.includes('nextjobbot') || ua.includes('jobbot');
        } else if (userAgentSection && trimmed.startsWith('disallow:')) {
          const path = trimmed.split(':')[1].trim();
          if (path === '/' || path.includes('/jobs') || path.includes('/careers')) {
            disallowed = true;
          }
        }
      }

      return { allowed: !disallowed, robotsTxt: html };
    } catch (error) {
      logger.warn(`Could not check robots.txt for ${domain}: ${error.message}`);
      return { allowed: true, error: error.message };
    }
  }

  /**
   * Normalize job data to standard format
   * Override in subclasses if needed
   */
  normalizeJob(job) {
    return {
      id: `${this.name}-${job.id || Math.random().toString(36).substr(2, 9)}`,
      title: job.title || '',
      company: job.company || this.name,
      location: job.location || '',
      description: (job.description || '').substring(0, 2000),
      url: job.url || '',
      salary: job.salary || '',
      job_type: job.job_type || '',
      posted_at: job.posted_at || new Date().toISOString(),
      source: this.name,
      is_remote: job.is_remote || false,
      tags: job.tags || [],
    };
  }

  /**
   * Fetch jobs - to be implemented by subclasses
   */
  async fetchJobs(options = {}) {
    throw new Error('fetchJobs must be implemented by subclass');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info(`${this.name}: Cache cleared`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.cache.size,
      ttl: this.cache.ttl,
    };
  }
}

module.exports = {
  BaseScraper,
  SimpleCache,
  RateLimiter,
  logger,
};
