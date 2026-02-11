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
  ranking_score?: number; // Add this missing property
}