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

export interface ApiError {
  error: string;
  message: string;
  status?: number;
}

export interface EnvironmentConfig {
  ADZUNA_APP_ID: string;
  ADZUNA_APP_KEY: string;
  PORT?: string;
  NODE_ENV?: string;
  FRONTEND_URL?: string;
}