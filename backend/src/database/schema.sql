-- Jobs table (existing)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  title_normalized TEXT,
  company TEXT,
  company_domain TEXT,
  location TEXT,
  location_normalized TEXT,
  remote BOOLEAN,
  posted_date INTEGER,
  ranking_score REAL DEFAULT 0,
  source TEXT,
  job_url TEXT,
  description TEXT,
  salary TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job tokens for search (existing)
CREATE TABLE IF NOT EXISTS job_tokens (
  token TEXT,
  job_id TEXT,
  weight REAL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  preferred_location TEXT,
  experience_level TEXT,
  remote_preference BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User resumes
CREATE TABLE IF NOT EXISTS user_resumes (
  user_id TEXT PRIMARY KEY,
  resume_text TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User interactions tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  user_id TEXT,
  job_id TEXT,
  interaction_type TEXT, -- view, click, save, apply
  count INTEGER DEFAULT 1,
  timestamp INTEGER,
  PRIMARY KEY (user_id, job_id, interaction_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Daily stats for analytics (existing)
CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT,
  token TEXT,
  job_count INTEGER,
  PRIMARY KEY (date, token)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_ranking ON jobs(ranking_score DESC, posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_job_tokens_token ON job_tokens(token);
CREATE INDEX IF NOT EXISTS idx_job_tokens_job_id ON job_tokens(job_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_job ON user_interactions(job_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);