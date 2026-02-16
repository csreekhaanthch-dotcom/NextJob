const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
  searchJobs: async (params: { query: string; location?: string; page?: number }): Promise<SearchJobsResponse> => {
    const urlParams = new URLSearchParams();
    urlParams.append("query", params.query);
    if (params.location) urlParams.append("location", params.location);
    if (params.page) urlParams.append("page", params.page.toString());

    const response = await fetch(`${API_BASE_URL}/api/jobs/search?${urlParams}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch jobs");
    }
    
    return response.json();
  },

  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};

export async function searchJobs(query: string, location?: string): Promise<SearchJobsResponse> {
  return api.searchJobs({ query, location });
}

export async function checkHealth() {
  return api.checkHealth();
}
