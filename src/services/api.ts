const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jobboard-backend-onrender.onrender.com';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  posted_date: number;
  job_url: string;
  description?: string;
  salary?: string;
  tags?: string[];
  logo?: string;
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

    const response = await fetch(`${this.baseUrl}/api/jobs?${urlParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  async getJob(id: string): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }

  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService(API_BASE_URL);