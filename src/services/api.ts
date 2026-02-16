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

export const api = {
  searchJobs: async (params: { 
    keyword?: string; 
    location?: string; 
    remote?: boolean; 
    page?: number; 
    limit?: number 
  }): Promise<SearchJobsResponse> => {
    const urlParams = new URLSearchParams();
    
    if (params.keyword) urlParams.append('keyword', params.keyword);
    if (params.location) urlParams.append('location', params.location);
    if (params.remote !== undefined) urlParams.append('remote', String(params.remote));
    if (params.page) urlParams.append('page', String(params.page));
    if (params.limit) urlParams.append('limit', String(params.limit));

    const response = await fetch(`${API_BASE_URL}/jobs?${urlParams}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch jobs');
    }
    
    return response.json();
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch job');
    }
    
    return response.json();
  },

  uploadResume: async (formData: FormData): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload resume');
    }
    
    return response.json();
  },

  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};