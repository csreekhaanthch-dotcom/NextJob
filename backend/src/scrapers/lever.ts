import { BaseScraper } from './base';
import axios from 'axios';
import { Job } from '../core/types';
import cheerio from 'cheerio';

export class LeverScraper extends BaseScraper {
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

      // Get jobs from Lever API
      const apiUrl = `${this.baseUrl}/api/v1/postings`;
      const response = await this.makeRequest(apiUrl);
      
      if (!response || !Array.isArray(response)) {
        console.log(`Invalid response from ${apiUrl}`);
        return jobs;
      }

      for (const posting of response) {
        try {
          // Skip if missing required fields
          if (!posting.text || !posting.hostedUrl) continue;
          
          // Extract job details
          const job: Job = this.normalizeJob({
            title: posting.text,
            company: this.extractCompanyName(),
            company_domain: this.extractDomain(this.extractCompanyName()),
            location: posting.categories?.location?.join(', ') || 'Remote',
            remote: posting.categories?.location?.some((loc: string) => 
              loc.toLowerCase().includes('remote')) || false,
            posted_date: posting.createdAt ? Math.floor(new Date(posting.createdAt).getTime() / 1000) : Date.now(),
            job_url: posting.hostedUrl,
            source: 'lever'
          });
          
          jobs.push(job);
          
          // Delay between requests to be respectful
          await this.delay();
        } catch (error) {
          console.error(`Error processing Lever job:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scraping Lever jobs from ${this.baseUrl}:`, error);
    }
    
    return jobs;
  }

  private extractCompanyName(): string {
    try {
      // Extract company name from URL
      const urlParts = this.baseUrl.replace('https://', '').replace('http://', '').split('.');
      return urlParts[0].charAt(0).toUpperCase() + urlParts[0].slice(1);
    } catch (error) {
      return 'Unknown Company';
    }
  }
}