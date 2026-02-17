const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  posted_date: number;
  tags?: string[];
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

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async searchJobs(params: { 
    search?: string; 
    location?: string; 
    page?: number; 
    limit?: number 
  }): Promise<SearchJobsResponse> {
    const urlParams = new URLSearchParams();
    
    if (params.search) urlParams.append('search', params.search);
    if (params.location) urlParams.append('location', params.location);
    if (params.page) urlParams.append('page', String(params.page));
    if (params.limit) urlParams.append('limit', String(params.limit));

    const url = `${this.baseUrl}/api/jobs?${urlParams}`;
    console.log('Making request to:', url);
    
    try {
      const response = await this.fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Fetch response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError) {
        if (error.message === 'Failed to fetch') {
          throw new Error('Unable to connect to the backend server. Please ensure the backend is running and accessible.');
        }
        throw new Error(`Network error: ${error.message}`);
      } else if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout - the backend is taking too long to respond');
      }
      throw error;
    }
  }

  async getJob(id: string): Promise<Job> {
    const url = `${this.baseUrl}/api/jobs/${id}`;
    console.log('Making request to:', url);
    
    try {
      const response = await this.fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the backend server. Please ensure the backend is running and accessible.');
      }
      throw error;
    }
  }

  async checkHealth(): Promise<any> {
    try {
      const healthUrl = `${this.baseUrl}/health`;
      console.log('Checking health at:', healthUrl);
      
      const response = await this.fetchWithTimeout(healthUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      }, 5000); // 5 second timeout for health check
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Health check error:', error);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Backend health check timeout - backend may be unresponsive');
      }
      throw new Error('Unable to connect to the backend server. Please ensure the backend is running.');
    }
  }
}

export const api = new ApiService(API_BASE_URL);