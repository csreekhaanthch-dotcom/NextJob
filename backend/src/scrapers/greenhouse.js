/**
 * Greenhouse ATS Scraper
 * Scrapes job listings from companies using Greenhouse ATS
 * Official public API: https://boards-api.greenhouse.io/v1/boards/{company}/jobs
 */

const { BaseScraper, RateLimiter, logger } = require('./base');
const companiesConfig = require('../../config/companies');

class GreenhouseScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'Greenhouse',
      baseUrl: 'https://boards-api.greenhouse.io/v1/boards',
      ...options,
    });

    // Rate limiter: 60 requests per minute (1 request per second)
    this.rateLimiter = new RateLimiter(60, 60000);
    
    // Get enabled companies
    this.companies = companiesConfig.getEnabledCompanies('greenhouse');
  }

  /**
   * Fetch jobs from a specific Greenhouse board
   */
  async fetchCompanyJobs(companyBoard) {
    try {
      const url = `${this.baseUrl}/${companyBoard}/jobs?content=true`;
      const data = await this.fetch(url);

      if (!data || !data.jobs) {
        logger.warn(`No jobs found for ${companyBoard}`);
        return [];
      }

      logger.info(`Fetched ${data.jobs.length} jobs from ${companyBoard}`);

      return data.jobs.map(job => this.normalizeJob(job, companyBoard));
    } catch (error) {
      logger.error(`Error fetching jobs from ${companyBoard}: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Greenhouse job data to standard format
   */
  normalizeJob(job, companyBoard) {
    // Extract location information
    let location = '';
    if (job.location) {
      location = typeof job.location === 'string' 
        ? job.location 
        : job.location.name || '';
    }

    // Determine if remote
    const isRemote = location.toLowerCase().includes('remote') ||
                     (job.offices && job.offices.some(o => o.location?.toLowerCase()?.includes('remote')));

    // Extract salary if available
    let salary = '';
    if (job.metadata) {
      const salaryField = job.metadata.find(m => 
        m.name.toLowerCase().includes('salary') || 
        m.name.toLowerCase().includes('compensation')
      );
      if (salaryField && salaryField.value) {
        salary = salaryField.value;
      }
    }

    // Extract job type
    let jobType = '';
    if (job.metadata) {
      const typeField = job.metadata.find(m => 
        m.name.toLowerCase().includes('type') || 
        m.name.toLowerCase().includes('employment')
      );
      if (typeField && typeField.value) {
        jobType = typeField.value;
      }
    }

    // Extract tags/keywords
    const tags = [];
    if (job.departments) {
      job.departments.forEach(dept => {
        if (dept.name) tags.push(dept.name);
      });
    }
    if (job.metadata) {
      job.metadata.forEach(m => {
        if (m.value && typeof m.value === 'string') {
          tags.push(m.value);
        }
      });
    }

    // Get company name from config
    const companyConfig = this.companies.find(c => c.board === companyBoard);
    const companyName = companyConfig ? companyConfig.name : companyBoard;

    return {
      id: `greenhouse-${companyBoard}-${job.id}`,
      title: job.title || '',
      company: companyName,
      location: location,
      description: (job.content || job.description || '').substring(0, 2000),
      url: job.absolute_url || job.url || `https://boards.greenhouse.io/${companyBoard}/jobs/${job.id}`,
      salary: salary,
      job_type: jobType,
      posted_at: job.updated_at || new Date().toISOString(),
      source: 'Greenhouse',
      is_remote: isRemote,
      tags: tags,
    };
  }

  /**
   * Fetch all jobs from all enabled Greenhouse companies
   */
  async fetchAllJobs(options = {}) {
    const { limit = Infinity, priority = Infinity } = options;

    // Filter by priority if specified
    let companiesToFetch = this.companies;
    if (priority < Infinity) {
      companiesToFetch = companiesConfig.getCompaniesByPriority('greenhouse', priority);
    }

    logger.info(`Fetching jobs from ${companiesToFetch.length} Greenhouse companies`);

    const results = [];
    let count = 0;

    // Fetch from each company
    for (const company of companiesToFetch) {
      if (count >= limit) break;

      try {
        const jobs = await this.fetchCompanyJobs(company.board);
        results.push(...jobs);
        count += jobs.length;
        logger.info(`Greenhouse progress: ${results.length} jobs from ${results.length} companies`);
      } catch (error) {
        logger.error(`Failed to fetch from ${company.name}: ${error.message}`);
      }
    }

    logger.info(`Greenhouse scraper completed: ${results.length} total jobs`);
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
const greenhouseScraper = new GreenhouseScraper();

// Helper functions for specific companies
const companyFetchers = {};

// Create fetcher for each company
companiesConfig.greenhouse.forEach(company => {
  if (company.enabled) {
    companyFetchers[company.name.toLowerCase()] = async (query, location, limit = 20) => {
      try {
        const jobs = await greenhouseScraper.fetchCompanyJobs(company.board);
        return greenhouseScraper.filterJobs(jobs, { query, location, limit });
      } catch (error) {
        logger.error(`Error fetching ${company.name}: ${error.message}`);
        return [];
      }
    };
  }
});

module.exports = {
  GreenhouseScraper,
  scraper: greenhouseScraper,
  fetchCompanyJobs: (board) => greenhouseScraper.fetchCompanyJobs(board),
  fetchAllJobs: (options) => greenhouseScraper.fetchJobs(options),
  getAvailableSources: () => greenhouseScraper.getAvailableSources(),
  companyFetchers,
};
