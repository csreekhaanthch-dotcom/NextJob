/**
 * Scrapers Index
 * Exports all scraper modules for easy importing
 */

// Base scraper and utilities
const { BaseScraper, SimpleCache, RateLimiter, logger } = require('./base');

// ATS scrapers
const { GreenhouseScraper, scraper: greenhouseScraper } = require('./greenhouse');
const { LeverScraper, scraper: leverScraper } = require('./lever');

// Custom scrapers
const { GoogleScraper, scraper: googleScraper } = require('./custom/google');
const { AppleScraper, scraper: appleScraper } = require('./custom/apple');
const { TeslaScraper, scraper: teslaScraper } = require('./custom/tesla');

module.exports = {
  // Base classes
  BaseScraper,
  SimpleCache,
  RateLimiter,
  logger,

  // ATS scrapers
  GreenhouseScraper,
  greenhouseScraper,
  LeverScraper,
  leverScraper,

  // Custom scrapers
  GoogleScraper,
  googleScraper,
  AppleScraper,
  appleScraper,
  TeslaScraper,
  teslaScraper,

  // Helper function to get all enabled scrapers
  getAllScrapers() {
    return {
      greenhouse: greenhouseScraper,
      lever: leverScraper,
      google: googleScraper,
      apple: appleScraper,
      tesla: teslaScraper,
    };
  },

  // Helper function to fetch jobs from all sources
  async fetchAllJobs(options = {}) {
    const scrapers = this.getAllScrapers();
    const results = [];

    for (const [name, scraper] of Object.entries(scrapers)) {
      if (scraper && scraper.enabled) {
        try {
          logger.info(`Fetching jobs from ${name}...`);
          const jobs = await scraper.fetchJobs(options);
          results.push(...jobs);
          logger.info(`${name}: ${jobs.length} jobs`);
        } catch (error) {
          logger.error(`Error fetching from ${name}: ${error.message}`);
        }
      }
    }

    // Deduplicate jobs
    const seen = new Set();
    return results.filter(job => {
      const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
};
