import { BaseScraper } from './base';
import axios from 'axios';
import { Job } from '../core/types';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

export class GenericScraper extends BaseScraper {
  constructor(baseUrl: string) {
    super(baseUrl, 3);
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

      // Try common job page URLs
      const jobUrls = [
        '/jobs',
        '/careers',
        '/career',
        '/openings',
        '/positions'
      ];
      
      for (const path of jobUrls) {
        try {
          const url = this.baseUrl + path;
          const response = await this.makeRequest(url);
          const scrapedJobs = await this.parseJobPage(response, url);
          jobs.push(...scrapedJobs);
          await this.delay();
        } catch (error) {
          // Continue trying other paths
          continue;
        }
      }
    } catch (error) {
      console.error(`Error scraping generic jobs from ${this.baseUrl}:`, error);
    }
    
    return jobs;
  }

  private async parseJobPage(html: string, url: string): Promise<Job[]> {
    const jobs: Job[] = [];
    const $ = cheerio.load(html);
    
    // Look for job listings with common selectors
    const jobSelectors = [
      '.job-posting', '.job-listing', '.position', '.opening',
      '[class*="job"]', '[class*="position"]', '[class*="opening"]'
    ];
    
    for (const selector of jobSelectors) {
      $(selector).each((index, element) => {
        try {
          const $element = $(element);
          
          // Try to extract job information
          const title = $element.find('h3, h4, .title, .job-title').first().text().trim() ||
                       $element.find('[class*="title"]').first().text().trim() ||
                       $element.find('a').first().text().trim();
          
          if (!title) return;
          
          const job: Job = this.normalizeJob({
            title: title,
            company: this.extractCompanyName(),
            company_domain: this.extractDomain(this.extractCompanyName()),
            location: this.extractLocation($element as any, $),
            remote: this.isRemote($element as any, $),
            posted_date: Date.now(),
            job_url: url,
            source: 'generic'
          });
          
          jobs.push(job);
        } catch (error) {
          // Continue with other elements
        }
      });
      
      // If we found jobs, we can stop checking other selectors
      if (jobs.length > 0) break;
    }
    
    return jobs;
  }

  private extractCompanyName(): string {
    try {
      // Extract company name from URL
      const urlObj = new URL(this.baseUrl);
      const hostname = urlObj.hostname.replace('www.', '');
      return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch (error) {
      return 'Unknown Company';
    }
  }

  private extractLocation($element: any, $: CheerioAPI): string {
    // Look for location information
    const locationSelectors = [
      '.location', '[class*="location"]', '.job-location',
      ':contains("location")', ':contains("Location")'
    ];
    
    for (const selector of locationSelectors) {
      const locationElement = $element.find ? $element.find(selector).first() : $(selector).first();
      if (locationElement.length > 0) {
        const text = locationElement.text().trim();
        if (text && text.length > 0) {
          return text;
        }
      }
    }
    
    return 'Remote';
  }

  private isRemote($element: any, $: CheerioAPI): boolean {
    const location = this.extractLocation($element, $);
    return location.toLowerCase().includes('remote') || 
           location.toLowerCase().includes('anywhere') ||
           location.toLowerCase().includes('distributed');
  }
}