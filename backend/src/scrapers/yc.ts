import { BaseScraper } from './base';
import axios from 'axios';
import { Job } from '../core/types';
import * as cheerio from 'cheerio';

export class YCScraper extends BaseScraper {
  constructor() {
    super('https://www.ycombinator.com/jobs', 10);
  }

  async scrape(): Promise<Job[]> {
    const jobs: Job[] = [];
    
    try {
      // Check robots.txt compliance
      const canScrape = await this.checkRobotsTxt();
      if (!canScrape) {
        console.log(`Skipping YC Jobs due to robots.txt restrictions`);
        return jobs;
      }

      // Get jobs from YC website
      const response = await this.makeRequest(this.baseUrl);
      const $ = cheerio.load(response);
      
      $('.job-row').each((index, element) => {
        try {
          const $element = $(element);
          const title = $element.find('.job-title').text().trim();
          const company = $element.find('.company-name').text().trim();
          const location = $element.find('.job-location').text().trim();
          const jobUrl = 'https://www.ycombinator.com' + $element.attr('href');
          
          // Skip if missing required fields
          if (!title || !company) return;
          
          // Extract job details
          const job: Job = this.normalizeJob({
            title: title,
            company: company,
            company_domain: this.extractDomain(company),
            location: location || 'Remote',
            remote: location.toLowerCase().includes('remote'),
            posted_date: Date.now(),
            job_url: jobUrl,
            source: 'yc'
          });
          
          jobs.push(job);
        } catch (error) {
          console.error(`Error processing YC job:`, error);
        }
      });
      
      // Delay between requests to be respectful
      await this.delay();
    } catch (error) {
      console.error(`Error scraping YC Jobs:`, error);
    }
    
    return jobs;
  }
}