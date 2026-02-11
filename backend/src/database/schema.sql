-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_normalized TEXT NOT NULL,
  company TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  location TEXT,
  location_normalized TEXT,
  remote INTEGER DEFAULT 0,
  posted_date INTEGER NOT NULL,
  ranking_score REAL DEFAULT 0.0,
  source TEXT NOT NULL,
  job_url TEXT UNIQUE NOT NULL,
  description TEXT,
  salary TEXT,
  tags TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Job tokens for search indexing
CREATE TABLE IF NOT EXISTS job_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL,
  job_id TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Analytics tables
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  token TEXT NOT NULL,
  job_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS company_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  job_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS location_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  job_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_title_normalized ON jobs(title_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_location_normalized ON jobs(location_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_ranking_score ON jobs(ranking_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company_domain ON jobs(company_domain);
CREATE INDEX IF NOT EXISTS idx_job_tokens_token ON job_tokens(token);
CREATE INDEX IF NOT EXISTS idx_job_tokens_job_id ON job_tokens(job_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date_token ON daily_stats(date, token);
CREATE INDEX IF NOT EXISTS idx_company_stats_date_domain ON company_stats(date, company_domain);
CREATE INDEX IF NOT EXISTS idx_location_stats_date_location ON location_stats(date, location);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_composite_search ON jobs(title_normalized, location_normalized, remote, ranking_score DESC);