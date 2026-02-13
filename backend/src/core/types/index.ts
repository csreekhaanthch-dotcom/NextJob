// Job data structure
export interface Job {
  id: string;
  title: string;
  title_normalized: string;
  company: string;
  company_domain: string;
  location: string;
  location_normalized: string;
  remote: boolean;
  posted_date: number; // unix timestamp
  source: string;
  job_url: string;
  description?: string;
  salary?: string;
  tags?: string[];
  ranking_score?: number;
}

// Tokenized job for search
export interface JobToken {
  token: string;
  job_id: string;
  weight: number;
}

// Search parameters
export interface SearchParams {
  keyword?: string;
  location?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}

// Search result
export interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

// Analytics data structures
export interface DailyStats {
  date: string;
  token: string;
  job_count: number;
}

export interface CompanyActivity {
  company_domain: string;
  job_count: number;
}

export interface TrendingSkill {
  token: string;
  count: number;
  growth_rate: number;
}

export interface LocationGrowth {
  location: string;
  job_count: number;
  growth_percentage: number;
}

// Ranking scores
export interface RankingScores {
  freshness_score: number;
  keyword_density_score: number;
  remote_bonus: number;
  company_activity_score: number;
  total_score: number;
}