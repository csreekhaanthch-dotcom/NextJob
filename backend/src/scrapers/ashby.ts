import { BaseScraper } from './base';
import axios from 'axios';
import { Job } from '../core/types';

export class AshbyScraper extends BaseScraper {
  constructor(baseUrl: string) {
    super(baseUrl, 5);
  }

  async scrape(): Promise<Job[]> {
    const jobs: Job[] = [];
    
    try {
      // Check robots.txt compliance
      const canScrape = await this.checkRobotsTxt();
      if (!canScrape) {
        console.log(`Skipping ${this.baseUrl} due to robots.txt restrictions`);
        return jobs;
      }

      // Get jobs from Ashby API
      const apiUrl = `${this.baseUrl}/api/v1/job-board`;
      const response = await this.makeRequest(apiUrl);
      
      if (!response || !response.jobBoard || !Array.isArray(response.jobBoard.jobs)) {
        console.log(`Invalid response from ${apiUrl}`);
        return jobs;
      }

      for (const jobData of response.jobBoard.jobs) {
        try {
          // Skip if missing required fields
          if (!jobData.title || !jobData.jobPostUrl) continue;
          
          // Extract job details
          const job: Job = this.normalizeJob({
            title: jobData.title,
            company: response.jobBoard.company.name,
            company_domain: response.jobBoard.company.websiteUrl 
              ? new URL(response.jobBoard.company.websiteUrl).hostname.replace('www.', '')
              : this.extractDomain(response.jobBoard.company.name),
            location: jobData.locationNames ? jobData.locationNames.join(', ') : 'Remote',
            remote: jobData.locationNames 
              ? jobData.locationNames.some((loc: string) => loc.toLowerCase().includes('remote'))
              : false,
            posted_date: jobData.publishedAt ? Math.floor(new Date(jobData.publishedAt).getTime() / 1000) : Date.now(),
            job_url: jobData.jobPostUrl,
            source: 'ashby',
            description: jobData.description || ''
          });
          
          jobs.push(job);
          
          // Delay between requests to be respectful
          await this.delay();
        } catch (error) {
          console.error(`Error processing Ashby job:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scraping Ashby jobs from ${this.baseUrl}:`, error);
    }
    
    return jobs;
  }
}