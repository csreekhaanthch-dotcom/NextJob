const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  posted_date: number;
  tags?: string[];
  skills?: string[];
  jobType?: string;
  experienceLevel?: string;
  workSetting?: 'remote' | 'hybrid' | 'on-site';
  industry?: string;
  source?: string;
  is_remote?: boolean;
  posted_at?: string;
}

export interface SearchJobsParams {
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
  skills?: string[];
  jobTypes?: string[];
  experienceLevels?: string[];
  datePosted?: string;
  salaryRange?: string;
  workSettings?: string[];
  industries?: string[];
  distance?: number;
  sortBy?: 'recent' | 'relevant' | 'salary_high' | 'salary_low';
}

export interface SearchJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdvancedFiltersState {
  jobTypes: string[];
  experienceLevels: string[];
  datePosted: string;
  salaryRange: string;
  workSettings: string[];
  industries: string[];
}

class ApiService {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    return response.json();
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async searchJobs(params: SearchJobsParams): Promise<SearchJobsResponse> {
    const urlParams = new URLSearchParams();
    if (params.search) urlParams.append('search', params.search);
    if (params.location) urlParams.append('location', params.location);
    if (params.page) urlParams.append('page', String(params.page));
    if (params.limit) urlParams.append('limit', String(params.limit));
    if (params.sortBy) urlParams.append('sortBy', params.sortBy);

    const url = `${this.baseUrl}/api/jobs?${urlParams}`;
    const response = await this.fetchWithTimeout(url);
    const data = await this.handleResponse(response);
    
    return {
      jobs: data.jobs || [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    };
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/health`);
    return await this.handleResponse(response);
  }

  filterJobsClientSide(jobs: Job[], filters: AdvancedFiltersState): Job[] {
    let filtered = [...jobs];

    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job => 
        filters.jobTypes.some(type => 
          job.jobType?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    if (filters.workSettings.length > 0) {
      filtered = filtered.filter(job => 
        filters.workSettings.some(setting =>
          job.workSetting === setting || 
          (setting === 'remote' && job.is_remote)
        )
      );
    }

    if (filters.datePosted) {
      const now = Date.now() / 1000;
      const daysMap: Record<string, number> = {
        '24h': 1,
        '3d': 3,
        '7d': 7,
        '14d': 14,
        '30d': 30,
      };
      const days = daysMap[filters.datePosted] || 0;
      if (days > 0) {
        const cutoff = now - (days * 24 * 60 * 60);
        filtered = filtered.filter(job => job.posted_date >= cutoff);
      }
    }

    return filtered;
  }

  async getSearchHistory(): Promise<string[]> {
    try {
      const stored = localStorage.getItem('searchHistory');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async saveSearchHistory(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filtered = history.filter(h => h !== query);
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch {
      // Ignore errors
    }
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
