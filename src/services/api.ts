const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Job {
  id: string;
  title: string;
  title_normalized: string;
  company: string;
  company_domain: string;
  location: string;
  location_normalized: string;
  remote: boolean;
  posted_date: number;
  source: string;
  job_url: string;
  description?: string;
  salary?: string;
  tags?: string[];
  ranking_score?: number;
}

export interface SearchJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async searchJobs(params: { 
    keyword?: string; 
    location?: string; 
    remote?: boolean; 
    page?: number; 
    limit?: number 
  }): Promise<SearchJobsResponse> {
    const urlParams = new URLSearchParams();
    
    if (params.keyword) urlParams.append('keyword', params.keyword);
    if (params.location) urlParams.append('location', params.location);
    if (params.remote !== undefined) urlParams.append('remote', String(params.remote));
    if (params.page) urlParams.append('page', String(params.page));
    if (params.limit) urlParams.append('limit', String(params.limit));

    const response = await fetch(`${this.baseUrl}/jobs?${urlParams}`);
    return this.handleResponse(response);
  }

  async getJob(id: string): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/jobs/${id}`);
    return this.handleResponse(response);
  }

  async uploadResume(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/match`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(response);
  }

  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    return this.handleResponse(response);
  }
}

export const api = new ApiService(API_BASE_URL);