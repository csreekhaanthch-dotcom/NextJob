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
    if (params.skills) params.skills.forEach(s => urlParams.append('skills', s));
    if (params.jobTypes) params.jobTypes.forEach(t => urlParams.append('jobType', t));
    if (params.experienceLevels) params.experienceLevels.forEach(l => urlParams.append('experienceLevel', l));
    if (params.datePosted && params.datePosted !== 'all') urlParams.append('datePosted', params.datePosted);
    if (params.salaryRange) urlParams.append('salaryRange', params.salaryRange);
    if (params.workSettings) params.workSettings.forEach(s => urlParams.append('workSetting', s));
    if (params.industries) params.industries.forEach(i => urlParams.append('industry', i));
    if (params.distance) urlParams.append('distance', String(params.distance));

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

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/jobs/${id}`);
      return await this.handleResponse(response);
    } catch {
      return null;
    }
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
