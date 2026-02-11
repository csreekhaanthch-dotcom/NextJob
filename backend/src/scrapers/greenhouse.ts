import { BaseScraper } from './base';
import axios from 'axios';
import { Job } from '../core/types';
import cheerio from 'cheerio';

export class GreenhouseScraper extends BaseScraper {
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

      // Get jobs from Greenhouse API
      const apiUrl = `${this.baseUrl}/boards/api/v1/jobs?content=true`;
      const response = await this.makeRequest(apiUrl);
      
      if (!response || !response.jobs || !Array.isArray(response.jobs)) {
        console.log(`Invalid response from ${apiUrl}`);
        return jobs;
      }

      for (const jobData of response.jobs) {
        try {
          // Skip if missing required fields
          if (!jobData.title || !jobData.absolute_url) continue;
          
          // Extract job details
          const job: Job = this.normalizeJob({
            title: jobData.title,
            company: this.extractCompanyName(),
            company_domain: this.extractDomain(this.extractCompanyName()),
            location: this.extractLocation(jobData),
            remote: this.isRemote(jobData),
            posted_date: jobData.updated_at ? Math.floor(new Date(jobData.updated_at).getTime() / 1000) : Date.now(),
            job_url: jobData.absolute_url,
            source: 'greenhouse',
            description: jobData.content ? this.stripHtmlTags(jobData.content) : ''
          });
          
          jobs.push(job);
          
          // Delay between requests to be respectful
          await this.delay();
        } catch (error) {
          console.error(`Error processing Greenhouse job:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scraping Greenhouse jobs from ${this.baseUrl}:`, error);
    }
    
    return jobs;
  }

  private extractCompanyName(): string {
    try {
      // Extract company name from URL
      const urlParts = this.baseUrl.replace('https://boards.greenhouse.io/', '').split('/');
      const companyName = urlParts[0];
      return companyName.charAt(0).toUpperCase() + companyName.slice(1);
    } catch (error) {
      return 'Unknown Company';
    }
  }

  private extractLocation(jobData: any): string {
    if (jobData.location && jobData.location.name) {
      return jobData.location.name;
    }
    
    if (jobData.offices && Array.isArray(jobData.offices) && jobData.offices.length > 0) {
      return jobData.offices.map((office: any) => office.name).join(', ');
    }
    
    return 'Remote';
  }

  private isRemote(jobData: any): boolean {
    if (jobData.location && jobData.location.name) {
      return jobData.location.name.toLowerCase().includes('remote');
    }
    
    if (jobData.offices && Array.isArray(jobData.offices)) {
      return jobData.offices.some((office: any) => 
        office.name && office.name.toLowerCase().includes('remote')
      );
    }
    
    return false;
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}