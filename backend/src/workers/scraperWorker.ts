import { jobService } from '../services/jobService';
import { LeverScraper } from '../scrapers/lever';
import { GreenhouseScraper } from '../scrapers/greenhouse';
import { AshbyScraper } from '../scrapers/ashby';
import { YCScraper } from '../scrapers/yc';
import { GenericScraper } from '../scrapers/generic';

class ScraperWorker {
  private running: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  // List of known job board URLs to scrape
  private jobBoards = [
    { type: 'lever', urls: ['https://jobs.lever.co/company'] },
    { type: 'greenhouse', urls: ['https://boards.greenhouse.io/company'] },
    { type: 'ashby', urls: ['https://jobs.ashbyhq.com/company'] },
    { type: 'yc', urls: ['https://www.ycombinator.com/jobs'] },
    { type: 'generic', urls: [
      'https://company.com/careers',
      'https://company.com/jobs',
      'https://company.com/openings'
    ]}
  ];

  async start() {
    this.running = true;
    console.log('Starting scraper worker...');
    
    // Run immediately
    await this.scrapeAll();
    
    // Schedule periodic scraping every hour
    this.intervalId = setInterval(async () => {
      if (this.running) {
        await this.scrapeAll();
      }
    }, 60 * 60 * 1000); // Every hour
  }

  async stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('Scraper worker stopped');
  }

  private async scrapeAll() {
    console.log('Running scheduled scraping job...');
    const startTime = Date.now();
    
    try {
      // Scrape each job board type
      for (const board of this.jobBoards) {
        for (const url of board.urls) {
          if (!this.running) break;
          
          try {
            let scraper;
            switch (board.type) {
              case 'lever':
                scraper = new LeverScraper(url);
                break;
              case 'greenhouse':
                scraper = new GreenhouseScraper(url);
                break;
              case 'ashby':
                scraper = new AshbyScraper(url);
                break;
              case 'yc':
                scraper = new YCScraper();
                break;
              case 'generic':
                scraper = new GenericScraper(url);
                break;
              default:
                continue;
            }
            
            console.log(`Scraping ${board.type} jobs from ${url}...`);
            const jobs = await scraper.scrape();
            
            // Process and store jobs
            for (const job of jobs) {
              try {
                const normalizedJob = jobService.normalizeJobFields(job);
                await jobService.upsertJob(normalizedJob);
              } catch (error) {
                console.error(`Error processing job ${job.id}:`, error);
              }
            }
            
            console.log(`Successfully scraped ${jobs.length} jobs from ${url}`);
          } catch (error) {
            console.error(`Error scraping ${board.type} from ${url}:`, error);
          }
        }
      }
      
      // Post-scraping cleanup
      await this.cleanup();
      
      const duration = Date.now() - startTime;
      console.log(`Scraping job completed in ${duration}ms`);
    } catch (error) {
      console.error('Error in scraping job:', error);
    }
  }

  private async cleanup() {
    console.log('Running post-scraping cleanup...');
    
    // Deduplicate jobs
    const dedupCount = await jobService.deduplicateJobs();
    console.log(`Removed ${dedupCount} duplicate jobs`);
    
    // Delete stale jobs (older than 30 days)
    const staleCount = await jobService.deleteStaleJobs(30);
    console.log(`Removed ${staleCount} stale jobs`);
    
    // Recalculate ranking scores
    await jobService.recalculateRankingScores();
    console.log('Recalculated ranking scores for all jobs');
  }
}

export const scraperWorker = new ScraperWorker();