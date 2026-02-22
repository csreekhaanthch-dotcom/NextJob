/**
 * Lever ATS Scraper
 * Scrapes job listings from companies using Lever ATS
 * Official public API: https://api.lever.co/v0/postings/{company}?mode=json
 */

const { BaseScraper, RateLimiter, logger } = require('./base');
const companiesConfig = require('../../config/companies');

class LeverScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'Lever',
      baseUrl: 'https://api.lever.co/v0/postings',
      ...options,
    });

    // Rate limiter: 60 requests per minute
    this.rateLimiter = new RateLimiter(60, 60000);
    
    // Get enabled companies
    this.companies = companiesConfig.getEnabledCompanies('lever');
  }

  /**
   * Fetch jobs from a specific Lever board
   */
  async fetchCompanyJobs(companyBoard) {
    try {
      const url = `${this.baseUrl}/${companyBoard}?mode=json`;
      const data = await this.fetch(url);

      if (!data || !Array.isArray(data)) {
        logger.warn(`No jobs found for ${companyBoard}`);
        return [];
      }

      logger.info(`Fetched ${data.length} jobs from ${companyBoard}`);

      return data.map(job => this.normalizeJob(job, companyBoard));
    } catch (error) {
      logger.error(`Error fetching jobs from ${companyBoard}: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Lever job data to standard format
   */
  normalizeJob(job, companyBoard) {
    // Extract location
    const location = job.categories?.location || '';
    const isRemote = location.toLowerCase().includes('remote') || 
                     job.categories?.commitment?.toLowerCase() === 'contract' ||
                     job.workMode?.toLowerCase() === 'remote';

    // Extract job type/commitment
    const jobType = job.categories?.commitment || job.workMode || '';

    // Extract department/function
    const department = job.categories?.department || job.categories?.team || '';

    // Extract tags
    const tags = [];
    if (department) tags.push(department);
    if (job.categories?.team) tags.push(job.categories.team);
    if (job.categories?.level) tags.push(job.categories.level);
    if (job.categories?.all) {
      job.categories.all.forEach(cat => {
        if (typeof cat === 'string') tags.push(cat);
      });
    }

    // Get company name from config
    const companyConfig = this.companies.find(c => c.board === companyBoard);
    const companyName = companyConfig ? companyConfig.name : companyBoard;

    return {
      id: `lever-${companyBoard}-${job.id}`,
      title: job.text || job.title || '',
      company: companyName,
      location: location,
      description: (job.descriptionPlain || job.description || '').substring(0, 2000),
      url: job.hostedUrl || job.url || `https://jobs.lever.co/${companyBoard}/${job.id}`,
      salary: '',
      job_type: jobType,
      posted_at: job.createdAt || new Date().toISOString(),
      source: 'Lever',
      is_remote: isRemote,
      tags: tags,
    };
  }

  /**
   * Fetch all jobs from all enabled Lever companies
   */
  async fetchAllJobs(options = {}) {
    const { limit = Infinity, priority = Infinity } = options;

    // Filter by priority if specified
    let companiesToFetch = this.companies;
    if (priority < Infinity) {
      companiesToFetch = companiesConfig.getCompaniesByPriority('lever', priority);
    }

    logger.info(`Fetching jobs from ${companiesToFetch.length} Lever companies`);

    const results = [];
    let count = 0;

    // Fetch from each company
    for (const company of companiesToFetch) {
      if (count >= limit) break;

      try {
        const jobs = await this.fetchCompanyJobs(company.board);
        results.push(...jobs);
        count += jobs.length;
        logger.info(`Lever progress: ${results.length} jobs from ${results.length} companies`);
      } catch (error) {
        logger.error(`Failed to fetch from ${company.name}: ${error.message}`);
      }
    }

    logger.info(`Lever scraper completed: ${results.length} total jobs`);
    return results;
  }

  /**
   * Fetch jobs with filtering
   */
  async fetchJobs(options = {}) {
    const {
      query = '',
      location = '',
      company = null,
      limit = 100,
      priority = Infinity,
    } = options;

    // If specific company requested
    if (company) {
      const companyConfig = this.companies.find(c => 
        c.name.toLowerCase() === company.toLowerCase() || 
        c.board.toLowerCase() === company.toLowerCase()
      );

      if (companyConfig) {
        const jobs = await this.fetchCompanyJobs(companyConfig.board);
        return this.filterJobs(jobs, { query, location, limit });
      }
    }

    // Fetch all jobs
    const allJobs = await this.fetchAllJobs({ priority });
    return this.filterJobs(allJobs, { query, location, limit });
  }

  /**
   * Filter jobs by query and location
   */
  filterJobs(jobs, { query, location, limit }) {
    let filtered = jobs;

    if (query) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(queryLower) ||
        job.description.toLowerCase().includes(queryLower) ||
        job.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );
    }

    if (location) {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationLower) ||
        (locationLower === 'remote' && job.is_remote)
      );
    }

    // Limit results
    return filtered.slice(0, limit);
  }

  /**
   * Get available sources (companies)
   */
  getAvailableSources() {
    return this.companies.map(c => ({
      name: c.name,
      board: c.board,
      enabled: c.enabled,
      priority: c.priority,
    }));
  }
}

// Create singleton instance
const leverScraper = new LeverScraper();

// Helper functions for specific companies
const companyFetchers = {};

// Create fetcher for each company
companiesConfig.lever.forEach(company => {
  if (company.enabled) {
    companyFetchers[company.name.toLowerCase()] = async (query, location, limit = 20) => {
      try {
        const jobs = await leverScraper.fetchCompanyJobs(company.board);
        return leverScraper.filterJobs(jobs, { query, location, limit });
      } catch (error) {
        logger.error(`Error fetching ${company.name}: ${error.message}`);
        return [];
      }
    };
  }
});

module.exports = {
  LeverScraper,
  scraper: leverScraper,
  fetchCompanyJobs: (board) => leverScraper.fetchCompanyJobs(board),
  fetchAllJobs: (options) => leverScraper.fetchJobs(options),
  getAvailableSources: () => leverScraper.getAvailableSources(),
  companyFetchers,
};
