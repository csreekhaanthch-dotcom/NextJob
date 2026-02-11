import axios from 'axios';
import { Job } from '../core/types';

export abstract class BaseScraper {
  protected baseUrl: string;
  protected userAgent: string;
  protected maxPages: number;
  protected requestDelay: number;

  constructor(baseUrl: string, maxPages: number = 10) {
    this.baseUrl = baseUrl;
    this.maxPages = maxPages;
    this.requestDelay = 1000; // 1 second delay between requests
    this.userAgent = 'JobDone/1.0 (https://jobdone.example.com)';
  }

  /**
   * Check robots.txt compliance
   */
  protected async checkRobotsTxt(): Promise<boolean> {
    try {
      const robotsUrl = `${this.baseUrl}/robots.txt`;
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        headers: { 'User-Agent': this.userAgent }
      });
      
      // Simple check for disallowed paths
      const disallowed = response.data.includes('Disallow: /jobs') || 
                        response.data.includes('Disallow: /careers');
      
      return !disallowed;
    } catch (error) {
      // If robots.txt doesn't exist, assume it's okay
      return true;
    }
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  protected async makeRequest(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': this.userAgent }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 403 || status === 429) {
          throw new Error(`Access denied or rate limited: ${status}`);
        }
      }
      throw error;
    }
  }

  /**
   * Delay between requests
   */
  protected async delay(ms: number = this.requestDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Normalize job data
   */
  protected normalizeJob(job: Partial<Job>): Job {
    return {
      id: job.id || this.generateJobId(job),
      title: job.title?.trim() || '',
      title_normalized: job.title?.toLowerCase().trim() || '',
      company: job.company?.trim() || '',
      company_domain: job.company_domain || this.extractDomain(job.company || ''),
      location: job.location?.trim() || '',
      location_normalized: job.location?.toLowerCase().trim() || '',
      remote: job.remote || false,
      posted_date: job.posted_date || Math.floor(Date.now() / 1000),
      source: job.source || this.constructor.name.replace('Scraper', '').toLowerCase(),
      job_url: job.job_url || '',
      description: job.description?.trim() || '',
      salary: job.salary?.trim() || '',
      tags: job.tags || []
    };
  }

  /**
   * Generate unique job ID
   */
  protected generateJobId(job: Partial<Job>): string {
    const uniqueString = `${job.title}-${job.company}-${job.job_url}`;
    return require('crypto').createHash('md5').update(uniqueString).digest('hex');
  }

  /**
   * Extract domain from company name
   */
  protected extractDomain(company: string): string {
    // Simple extraction - in real implementation would use more sophisticated logic
    return company.toLowerCase().replace(/\s+/g, '') + '.com';
  }

  /**
   * Abstract method to be implemented by specific scrapers
   */
  abstract scrape(): Promise<Job[]>;
}