/**
 * Meta Jobs Scraper
 * Scrapes job listings from Meta's careers page
 * URL: https://www.metacareers.com
 *
 * Note: Meta uses a custom careers system that may change frequently.
 * This scraper attempts to fetch from their public API if available,
 * otherwise returns an empty array.
 */

const { BaseScraper, RateLimiter, logger } = require('../base');

class MetaScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'Meta',
      baseUrl: 'https://www.metacareers.com',
      ...options,
    });

    // Rate limiter: 30 requests per minute (1 request per 2 seconds - conservative)
    this.rateLimiter = new RateLimiter(30, 60000);
  }

  /**
   * Fetch jobs from Meta careers
   */
  async fetchJobs(options = {}) {
    const { query = '', location = '', limit = 50 } = options;

    try {
      // Meta doesn't have a public API, so we'll return an empty array
      // In production, this would require a headless browser or web scraping
      logger.warn('Meta scraper: No public API available, requires headless browser scraping');
      return [];
    } catch (error) {
      logger.error(`Error fetching Meta jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Meta job data
   */
  normalizeJob(job) {
    return {
      id: `meta-${job.id || Math.random().toString(36).substr(2, 9)}`,
      title: job.title || '',
      company: 'Meta',
      location: job.location || '',
      description: (job.description || '').substring(0, 2000),
      url: job.url || `https://www.metacareers.com/jobs/${job.id}`,
      salary: '',
      job_type: job.type || '',
      posted_at: new Date().toISOString(),
      source: 'Meta',
      is_remote: job.location?.toLowerCase().includes('remote') || false,
      tags: job.categories || [],
    };
  }
}

module.exports = {
  MetaScraper,
  scraper: new MetaScraper(),
  fetchJobs: (options) => new MetaScraper().fetchJobs(options),
};
