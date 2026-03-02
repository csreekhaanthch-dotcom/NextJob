/**
 * Tesla Jobs Scraper
 * Scrapes job listings from Tesla's careers page
 * URL: https://www.tesla.com/careers
 *
 * Note: Tesla uses a custom careers system that may change frequently.
 * This scraper attempts to fetch from their public API if available,
 * otherwise returns an empty array.
 */

const { BaseScraper, RateLimiter, logger } = require('../base');

class TeslaScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'Tesla',
      baseUrl: 'https://www.tesla.com',
      ...options,
    });

    // Rate limiter: 30 requests per minute (1 request per 2 seconds - conservative)
    this.rateLimiter = new RateLimiter(30, 60000);
  }

  /**
   * Fetch jobs from Tesla careers
   */
  async fetchJobs(options = {}) {
    const { query = '', location = '', limit = 50 } = options;

    try {
      // Tesla doesn't have a public API, so we'll return an empty array
      // In production, this would require a headless browser or web scraping
      logger.warn('Tesla scraper: No public API available, requires headless browser scraping');
      return [];
    } catch (error) {
      logger.error(`Error fetching Tesla jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Tesla job data
   */
  normalizeJob(job) {
    return {
      id: `tesla-${job.id || Math.random().toString(36).substr(2, 9)}`,
      title: job.title || '',
      company: 'Tesla',
      location: job.location || '',
      description: (job.description || '').substring(0, 2000),
      url: job.url || `https://www.tesla.com/careers/job/${job.id}`,
      salary: '',
      job_type: job.type || '',
      posted_at: new Date().toISOString(),
      source: 'Tesla',
      is_remote: job.location?.toLowerCase().includes('remote') || false,
      tags: job.categories || [],
    };
  }
}

module.exports = {
  TeslaScraper,
  scraper: new TeslaScraper(),
  fetchJobs: (options) => new TeslaScraper().fetchJobs(options),
};
