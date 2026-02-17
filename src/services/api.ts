const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  company_domain?: string;
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
    console.log('API response received:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
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

    const url = `${this.baseUrl}/api/jobs?${urlParams}`;
    console.log('Making request to:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Fetch response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the backend server. Please ensure the backend is running and accessible.');
      }
      throw error;
    }
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
    try {
      // In development, check local backend
      // In production, assume backend is integrated
      const healthUrl = `${this.baseUrl}/health`;
      console.log('Checking health at:', healthUrl);
      
      const response = await fetch(healthUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      // Return a specific error message when backend is unreachable
      throw new Error('Unable to connect to the backend server. Please ensure the backend is running.');
    }
  }
}

export const api = new ApiService(API_BASE_URL);