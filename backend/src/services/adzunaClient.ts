import { URL } from 'url';
import { logger } from '../utils/logger';

interface AdzunaJob {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  created: string;
  category?: {
    label: string;
  };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

class AdzunaClient {
  private readonly appId: string;
  private readonly appKey: string;
  private readonly baseUrl: string = 'https://api.adzuna.com/v1/api/jobs/us/search';

  constructor() {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables are required');
    }
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
  }

  async searchJobs(params: {
    search?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: any[]; total: number; page: number; totalPages: number }> {
    const { search = 'software', location, page = 1, limit = 10 } = params;
    
    const url = new URL(`${this.baseUrl}/${page - 1}`);
    url.searchParams.append('app_id', this.appId);
    url.searchParams.append('app_key', this.appKey);
    url.searchParams.append('results_per_page', limit.toString());
    url.searchParams.append('what', search);
    url.searchParams.append('content-type', 'application/json');
    
    if (location && location !== 'United States') {
      url.searchParams.append('where', location);
    } else {
      url.searchParams.append('location0', 'United States');
    }

    logger.info('Making request to Adzuna API', { url: url.toString() });

    try {
      const response = await this.makeRequestWithRetry(url.toString());
      const data: AdzunaResponse = await response.json() as AdzunaResponse;
      
      const jobs = data.results.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || 'Remote',
        description: job.description || '',
        url: job.redirect_url || '#',
        salary: job.salary_min && job.salary_max 
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : 'Not specified',
        posted_date: Math.floor(new Date(job.created).getTime() / 1000),
        tags: job.category?.label ? [job.category.label] : []
      }));

      return {
        jobs,
        total: data.count || jobs.length,
        page,
        totalPages: Math.ceil((data.count || jobs.length) / limit)
      };
    } catch (error) {
      logger.error('Error fetching jobs from Adzuna API', { error });
      throw new Error(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async makeRequestWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          logger.warn('Adzuna API returned non-ok status', { 
            status: response.status, 
            statusText: response.statusText,
            errorText
          });
          
          if (response.status >= 500 && i < retries) {
            // Retry on server errors
            await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
            continue;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response;
      } catch (error) {
        if (i === retries) {
          throw error;
        }
        
        logger.warn(`Attempt ${i + 1} failed, retrying...`, { error });
        await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const adzunaClient = new AdzunaClient();