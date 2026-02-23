/**
 * Spotify Jobs Scraper
 * Scrapes job listings from Spotify's careers page
 * URL: https://www.lifeatspotify.com/jobs
 *
 * Note: Spotify uses a custom careers system that may change frequently.
 * This scraper attempts to fetch from their public API if available,
 * otherwise returns an empty array.
 */

const { BaseScraper, RateLimiter, logger } = require('../base');

class SpotifyScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'Spotify',
      baseUrl: 'https://www.lifeatspotify.com',
      ...options,
    });

    // Rate limiter: 30 requests per minute (1 request per 2 seconds - conservative)
    this.rateLimiter = new RateLimiter(30, 60000);
  }

  /**
   * Fetch jobs from Spotify careers
   */
  async fetchJobs(options = {}) {
    const { query = '', location = '', limit = 50 } = options;

    try {
      // Spotify doesn't have a public API, so we'll return an empty array
      // In production, this would require a headless browser or web scraping
      logger.warn('Spotify scraper: No public API available, requires headless browser scraping');
      return [];
    } catch (error) {
      logger.error(`Error fetching Spotify jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Spotify job data
   */
  normalizeJob(job) {
    return {
      id: `spotify-${job.id || Math.random().toString(36).substr(2, 9)}`,
      title: job.title || '',
      company: 'Spotify',
      location: job.location || '',
      description: (job.description || '').substring(0, 2000),
      url: job.url || `https://www.lifeatspotify.com/jobs/${job.id}`,
      salary: '',
      job_type: job.type || '',
      posted_at: new Date().toISOString(),
      source: 'Spotify',
      is_remote: job.location?.toLowerCase().includes('remote') || false,
      tags: job.categories || [],
    };
  }
}

module.exports = {
  SpotifyScraper,
  scraper: new SpotifyScraper(),
  fetchJobs: (options) => new SpotifyScraper().fetchJobs(options),
};
