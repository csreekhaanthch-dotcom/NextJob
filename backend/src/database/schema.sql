-- NextJob Database Schema
-- SQLite database for job caching and storage

-- Jobs table - stores cached job listings
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  url TEXT NOT NULL,
  salary TEXT,
  job_type TEXT,
  posted_at TEXT,
  source TEXT NOT NULL,
  is_remote INTEGER DEFAULT 0,
  tags TEXT, -- JSON array of tags
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT -- When this cached job should be refreshed
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);

-- Full-text search index for job content
CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
  title,
  company,
  description,
  content='jobs',
  content_rowid='rowid'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS jobs_ai AFTER INSERT ON jobs BEGIN
  INSERT INTO jobs_fts(rowid, title, company, description)
  VALUES (new.rowid, new.title, new.company, new.description);
END;

CREATE TRIGGER IF NOT EXISTS jobs_ad AFTER DELETE ON jobs BEGIN
  INSERT INTO jobs_fts(jobs_fts, rowid, title, company, description)
  VALUES ('delete', old.rowid, old.title, old.company, old.description);
END;

CREATE TRIGGER IF NOT EXISTS jobs_au AFTER UPDATE ON jobs BEGIN
  INSERT INTO jobs_fts(jobs_fts, rowid, title, company, description)
  VALUES ('delete', old.rowid, old.title, old.company, old.description);
  INSERT INTO jobs_fts(rowid, title, company, description)
  VALUES (new.rowid, new.title, new.company, new.description);
END;

-- Scraping stats table - tracks scraping runs
CREATE TABLE IF NOT EXISTS scraping_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  jobs_fetched INTEGER DEFAULT 0,
  jobs_added INTEGER DEFAULT 0,
  jobs_updated INTEGER DEFAULT 0,
  jobs_failed INTEGER DEFAULT 0,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_scraping_stats_source ON scraping_stats(source);
CREATE INDEX IF NOT EXISTS idx_scraping_stats_started_at ON scraping_stats(started_at);

-- User saved jobs (stored locally)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  user_id TEXT,
  saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);

-- User job applications tracking
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT DEFAULT 'applied', -- applied, interviewing, offer, rejected, withdrawn
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  company_response TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);

-- Job alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  search_query TEXT,
  location TEXT,
  job_type TEXT,
  min_salary INTEGER,
  remote_only INTEGER DEFAULT 0,
  frequency TEXT DEFAULT 'daily', -- daily, weekly
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_sent TEXT,
  jobs_sent_count INTEGER DEFAULT 0
);

-- Application settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES
  ('last_scrape_run', NULL),
  ('scraper_enabled', 'true'),
  ('cache_ttl_hours', '24'),
  ('max_jobs_per_source', '1000');
