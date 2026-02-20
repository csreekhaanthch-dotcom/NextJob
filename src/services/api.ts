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
    if (params.workSettings) params.workSettings.forEach(w => urlParams.append('workSetting', w));
    if (params.industries) params.industries.forEach(i => urlParams.append('industry', i));

    const url = `${this.baseUrl}/api/jobs?${urlParams}`;
    try {
      const response = await this.fetchWithTimeout(url, { headers: { 'Content-Type': 'application/json' } });
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to backend server');
      }
      throw error;
    }
  }

  async getJob(id: string): Promise<Job> {
    const response = await this.searchJobs({});
    const job = response.jobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found');
    return job;
  }

  async checkHealth(): Promise<any> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, { headers: { 'Content-Type': 'application/json' } }, 5000);
    return this.handleResponse(response);
  }

  filterJobsClientSide(jobs: Job[], params: SearchJobsParams): Job[] {
    let filtered = [...jobs];
    if (params.skills && params.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobSkills = job.skills || job.tags || [];
        return params.skills!.some(s => jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase())));
      });
    }
    if (params.jobTypes && params.jobTypes.length > 0) {
      filtered = filtered.filter(job => job.jobType && params.jobTypes!.includes(job.jobType));
    }
    if (params.experienceLevels && params.experienceLevels.length > 0) {
      filtered = filtered.filter(job => job.experienceLevel && params.experienceLevels!.includes(job.experienceLevel));
    }
    if (params.workSettings && params.workSettings.length > 0) {
      filtered = filtered.filter(job => job.workSetting && params.workSettings!.includes(job.workSetting));
    }
    if (params.datePosted && params.datePosted !== 'all') {
      const now = Date.now();
      const dayMs = 86400000;
      const days: Record<string, number> = { '24h': 1, '3d': 3, '7d': 7, '14d': 14, '30d': 30 };
      const minDate = now - (days[params.datePosted] || 0) * dayMs;
      filtered = filtered.filter(job => job.posted_date >= minDate / 1000);
    }
    if (params.sortBy) {
      if (params.sortBy === 'recent') filtered.sort((a, b) => b.posted_date - a.posted_date);
      else if (params.sortBy === 'salary_high') filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      else if (params.sortBy === 'salary_low') filtered.sort((a, b) => (a.salaryMin || Infinity) - (b.salaryMin || Infinity));
    }
    return filtered;
  }
}

export const api = new ApiService(API_BASE_URL);
