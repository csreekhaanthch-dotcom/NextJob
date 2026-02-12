-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('user', 'recruiter')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_normalized TEXT,
  company TEXT,
  company_domain TEXT,
  company_id UUID REFERENCES companies(id),
  location TEXT,
  location_normalized TEXT,
  remote BOOLEAN DEFAULT FALSE,
  posted_date INTEGER,
  ranking_score REAL DEFAULT 0,
  source TEXT,
  job_url TEXT UNIQUE,
  description TEXT,
  salary TEXT,
  tags TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User behavior tracking
CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('view', 'save', 'apply', 'click')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_behavior_user_job ON user_behavior(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp);

-- Job matches
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_matches_user ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(score DESC);

-- Recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recruiter candidate matches
CREATE TABLE IF NOT EXISTS recruiter_candidate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES recruiters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recruiter_candidate_matches_recruiter ON recruiter_candidate_matches(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidate_matches_score ON recruiter_candidate_matches(score DESC);

-- Job tokens for search
CREATE TABLE IF NOT EXISTS job_tokens (
  token TEXT,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  weight REAL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_tokens_token ON job_tokens(token);
CREATE INDEX IF NOT EXISTS idx_job_tokens_job_id ON job_tokens(job_id);

-- Daily stats for analytics
CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT,
  token TEXT,
  job_count INTEGER,
  PRIMARY KEY (date, token)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_candidate_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY user_policy ON users 
FOR ALL USING (id = auth.uid());

CREATE POLICY resume_policy ON resumes 
FOR ALL USING (user_id = auth.uid());

CREATE POLICY job_matches_policy ON job_matches 
FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_behavior_policy ON user_behavior 
FOR ALL USING (user_id = auth.uid());

-- Recruiters can only access their own matches
CREATE POLICY recruiter_policy ON recruiters 
FOR ALL USING (user_id = auth.uid());

CREATE POLICY recruiter_candidate_matches_policy ON recruiter_candidate_matches 
FOR ALL USING (recruiter_id IN (SELECT id FROM recruiters WHERE user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_ranking ON jobs(ranking_score DESC, posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location_normalized);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location_remote ON jobs(location_normalized, remote);