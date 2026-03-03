/**
 * Database Connection Manager
 * Manages SQLite database connections and operations
 */

const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/jobs.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/**
 * Get database connection (singleton)
 */
function getConnection() {
  if (!db) {
    db = sqlite3(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    console.log(`[Database] Connected to ${DB_PATH}`);
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema() {
  const db = getConnection();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Split schema into individual statements and execute
  const statements = schema.split(';').filter(s => s.trim().length > 0);
  
  for (const statement of statements) {
    try {
      db.exec(statement + ';');
    } catch (error) {
      // Ignore "already exists" errors
      if (!error.message.includes('already exists')) {
        console.error('[Database] Schema error:', error.message);
      }
    }
  }
  
  console.log('[Database] Schema initialized');
}

/**
 * Close database connection
 */
function closeConnection() {
  if (db) {
    db.close();
    db = null;
    console.log('[Database] Connection closed');
  }
}

/**
 * Insert or update a job
 */
function upsertJob(job) {
  const db = getConnection();
  
  const stmt = db.prepare(`
    INSERT INTO jobs (
      id, title, company, location, description, url, salary, 
      job_type, posted_at, source, is_remote, tags, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+24 hours'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      location = excluded.location,
      description = excluded.description,
      url = excluded.url,
      salary = excluded.salary,
      job_type = excluded.job_type,
      posted_at = excluded.posted_at,
      is_remote = excluded.is_remote,
      tags = excluded.tags,
      updated_at = CURRENT_TIMESTAMP,
      expires_at = datetime('now', '+24 hours')
  `);
  
  const tagsJson = job.tags ? JSON.stringify(job.tags) : '[]';
  
  const result = stmt.run(
    job.id,
    job.title,
    job.company,
    job.location,
    job.description,
    job.url,
    job.salary,
    job.job_type,
    job.posted_at,
    job.source,
    job.is_remote ? 1 : 0,
    tagsJson
  );
  
  return result.changes > 0;
}

/**
 * Insert multiple jobs in a transaction
 */
function upsertJobs(jobs) {
  const db = getConnection();
  let added = 0;
  let updated = 0;
  
  const insert = db.prepare(`
    INSERT INTO jobs (
      id, title, company, location, description, url, salary,
      job_type, posted_at, source, is_remote, tags, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+24 hours'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      location = excluded.location,
      description = excluded.description,
      url = excluded.url,
      salary = excluded.salary,
      job_type = excluded.job_type,
      posted_at = excluded.posted_at,
      is_remote = excluded.is_remote,
      tags = excluded.tags,
      updated_at = CURRENT_TIMESTAMP,
      expires_at = datetime('now', '+24 hours')
  `);
  
  const getJob = db.prepare('SELECT id FROM jobs WHERE id = ?');
  
  const insertMany = db.transaction((jobs) => {
    for (const job of jobs) {
      const exists = getJob.get(job.id);
      const tagsJson = job.tags ? JSON.stringify(job.tags) : '[]';
      
      insert.run(
        job.id,
        job.title,
        job.company,
        job.location,
        job.description,
        job.url,
        job.salary,
        job.job_type,
        job.posted_at,
        job.source,
        job.is_remote ? 1 : 0,
        tagsJson
      );
      
      if (exists) {
        updated++;
      } else {
        added++;
      }
    }
  });
  
  insertMany(jobs);
  return { added, updated };
}

/**
 * Search jobs with filters
 */
function searchJobs(filters = {}) {
  const db = getConnection();
  const {
    query = '',
    location = '',
    company = '',
    source = '',
    isRemote = null,
    limit = 50,
    offset = 0,
  } = filters;
  
  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];
  
  if (query) {
    sql += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const pattern = `%${query}%`;
    params.push(pattern, pattern, pattern);
  }
  
  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }
  
  if (company) {
    sql += ' AND company LIKE ?';
    params.push(`%${company}%`);
  }
  
  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }
  
  if (isRemote !== null) {
    sql += ' AND is_remote = ?';
    params.push(isRemote ? 1 : 0);
  }
  
  // Exclude expired jobs
  sql += ' AND (expires_at IS NULL OR expires_at > datetime(\'now\'))';
  
  sql += ' ORDER BY posted_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stmt = db.prepare(sql);
  const jobs = stmt.all(...params);
  
  // Parse tags JSON
  return jobs.map(job => ({
    ...job,
    tags: job.tags ? JSON.parse(job.tags) : [],
    is_remote: !!job.is_remote,
    posted_date: new Date(job.posted_at).getTime() / 1000,
  }));
}

/**
 * Get job count
 */
function getJobCount(filters = {}) {
  const db = getConnection();
  const { source = '', company = '' } = filters;
  
  let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
  const params = [];
  
  if (source) {
    sql += ' AND source = ?';
    params.push(source);
  }
  
  if (company) {
    sql += ' AND company = ?';
    params.push(company);
  }
  
  sql += ' AND (expires_at IS NULL OR expires_at > datetime(\'now\'))';
  
  const stmt = db.prepare(sql);
  const result = stmt.get(...params);
  return result.count;
}

/**
 * Get job by ID
 */
function getJobById(id) {
  const db = getConnection();
  const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
  const job = stmt.get(id);
  
  if (job) {
    job.tags = job.tags ? JSON.parse(job.tags) : [];
    job.is_remote = !!job.is_remote;
  }
  
  return job;
}

/**
 * Delete expired jobs
 */
function deleteExpiredJobs() {
  const db = getConnection();
  const stmt = db.prepare("DELETE FROM jobs WHERE expires_at < datetime('now')");
  const result = stmt.run();
  return result.changes;
}

/**
 * Get all companies
 */
function getCompanies() {
  const db = getConnection();
  const stmt = db.prepare(`
    SELECT company, COUNT(*) as job_count 
    FROM jobs 
    WHERE expires_at > datetime('now') OR expires_at IS NULL
    GROUP BY company 
    ORDER BY job_count DESC
  `);
  return stmt.all();
}

/**
 * Get all sources with counts
 */
function getSources() {
  const db = getConnection();
  const stmt = db.prepare(`
    SELECT source, COUNT(*) as job_count
    FROM jobs
    WHERE expires_at > datetime('now') OR expires_at IS NULL
    GROUP BY source
    ORDER BY job_count DESC
  `);
  return stmt.all();
}

/**
 * Record scraping stats
 */
function recordScrapingStats(stats) {
  const db = getConnection();
  const stmt = db.prepare(`
    INSERT INTO scraping_stats 
    (source, jobs_fetched, jobs_added, jobs_updated, jobs_failed, started_at, completed_at, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  return stmt.run(
    stats.source,
    stats.jobs_fetched || 0,
    stats.jobs_added || 0,
    stats.jobs_updated || 0,
    stats.jobs_failed || 0,
    stats.started_at,
    stats.completed_at || new Date().toISOString(),
    stats.error_message || null
  );
}

/**
 * Get scraping stats
 */
function getScrapingStats(limit = 50) {
  const db = getConnection();
  const stmt = db.prepare(`
    SELECT * FROM scraping_stats
    ORDER BY started_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Save a job for user
 */
function saveJob(userId, jobId, notes = '') {
  const db = getConnection();
  const id = `${userId}_${jobId}`;
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO saved_jobs (id, job_id, user_id, notes, saved_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  
  return stmt.run(id, jobId, userId, notes);
}

/**
 * Get user's saved jobs
 */
function getSavedJobs(userId) {
  const db = getConnection();
  const stmt = db.prepare(`
    SELECT j.*, s.notes, s.saved_at
    FROM jobs j
    JOIN saved_jobs s ON j.id = s.job_id
    WHERE s.user_id = ?
    ORDER BY s.saved_at DESC
  `);
  
  const jobs = stmt.all(userId);
  return jobs.map(job => ({
    ...job,
    tags: job.tags ? JSON.parse(job.tags) : [],
    is_remote: !!job.is_remote,
  }));
}

module.exports = {
  getConnection,
  initializeSchema,
  closeConnection,
  upsertJob,
  upsertJobs,
  searchJobs,
  getJobCount,
  getJobById,
  deleteExpiredJobs,
  getCompanies,
  getSources,
  recordScrapingStats,
  getScrapingStats,
  saveJob,
  getSavedJobs,
};
