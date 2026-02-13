const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  performance?: {
    duration_ms: number;
    cached: boolean;
  };
}

export interface SearchParams {
  keyword?: string;
  location?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error || ''}`);
    }

    return response.json();
  }

  async getJobs(params?: SearchParams): Promise<JobsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.remote !== undefined) queryParams.append('remote', String(params.remote));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.fetch<JobsResponse>(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: string): Promise<Job> {
    return this.fetch<Job>(`/jobs/${id}`);
  }

  async uploadResume(file: File): Promise<{ matches: any[] }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${this.baseUrl}/match`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.fetch<{ status: string }>('/health');
  }
}

export const api = new ApiService();