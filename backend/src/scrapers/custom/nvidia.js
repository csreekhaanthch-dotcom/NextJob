/**
 * NVIDIA Jobs Scraper
 * Scrapes job listings from NVIDIA's careers page
 * URL: https://www.nvidia.com/en-us/about-nvidia/careers
 *
 * Note: NVIDIA uses a custom careers system that may change frequently.
 * This scraper attempts to fetch from their public API if available,
 * otherwise returns an empty array.
 */

const { BaseScraper, RateLimiter, logger } = require('../base');

class NVIDIASScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'NVIDIA',
      baseUrl: 'https://www.nvidia.com',
      ...options,
    });

    // Rate limiter: 30 requests per minute (1 request per 2 seconds - conservative)
    this.rateLimiter = new RateLimiter(30, 60000);
  }

  /**
   * Fetch jobs from NVIDIA careers
   */
  async fetchJobs(options = {}) {
    const { query = '', location = '', limit = 50 } = options;

    try {
      // NVIDIA doesn't have a public API, so we'll return an empty array
      // In production, this would require a headless browser or web scraping
      logger.warn('NVIDIA scraper: No public API available, requires headless browser scraping');
      return [];
    } catch (error) {
      logger.error(`Error fetching NVIDIA jobs: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize NVIDIA job data
   */
  normalizeJob(job) {
    return {
      id: `nvidia-${job.id || Math.random().toString(36).substr(2, 9)}`,
      title: job.title || '',
      company: 'NVIDIA',
      location: job.location || '',
      description: (job.description || '').substring(0, 2000),
      url: job.url || `https://www.nvidia.com/en-us/about-nvidia/careers/job/${job.id}`,
      salary: '',
      job_type: job.type || '',
      posted_at: new Date().toISOString(),
      source: 'NVIDIA',
      is_remote: job.location?.toLowerCase().includes('remote') || false,
      tags: job.categories || [],
    };
  }
}

module.exports = {
  NVIDIASScraper,
  scraper: new NVIDIASScraper(),
  fetchJobs: (options) => new NVIDIASScraper().fetchJobs(options),
};
