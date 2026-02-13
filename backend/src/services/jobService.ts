import { dbManager } from '../database/connection';
import { Job, JobToken } from '../core/types';
import { tokenizer } from '../core/tokenizer';
import { rankingEngine } from '../core/ranking';
import { jobServiceSupabase } from './jobService.supabase';

class JobService {
  /**
   * Insert or update job in database
   */
  async upsertJob(job: Job): Promise<void> {
    if (dbManager.isUsingSupabase()) {
      return jobServiceSupabase.upsertJob(job);
    }
    
    const db = dbManager.getDB();
    
    // Start transaction
    const transaction = db.transaction(() => {
      // Upsert job
      const upsertStmt = db.prepare(`
        INSERT INTO jobs (
          id, title, title_normalized, company, company_domain,
          location, location_normalized, remote, posted_date,
          ranking_score, source, job_url, description, salary, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          title_normalized = excluded.title_normalized,
          company = excluded.company,
          company_domain = excluded.company_domain,
          location = excluded.location,
          location_normalized = excluded.location_normalized,
          remote = excluded.remote,
          posted_date = excluded.posted_date,
          source = excluded.source,
          job_url = excluded.job_url,
          description = excluded.description,
          salary = excluded.salary,
          tags = excluded.tags,
          updated_at = strftime('%s', 'now')
      `);
      
      upsertStmt.run(
        job.id,
        job.title,
        job.title_normalized,
        job.company,
        job.company_domain,
        job.location,
        job.location_normalized,
        job.remote ? 1 : 0,
        job.posted_date,
        job.ranking_score || 0,
        job.source,
        job.job_url,
        job.description || null,
        job.salary || null,
        job.tags ? JSON.stringify(job.tags) : null
      );
      
      // Delete existing tokens for this job
      const deleteTokensStmt = db.prepare('DELETE FROM job_tokens WHERE job_id = ?');
      deleteTokensStmt.run(job.id);
      
      // Tokenize job and insert tokens
      const tokenWeights = tokenizer.tokenizeJob(job);
      const insertTokenStmt = db.prepare(`
        INSERT INTO job_tokens (token, job_id, weight)
        VALUES (?, ?, ?)
      `);
      
      Object.entries(tokenWeights).forEach(([token, weight]) => {
        insertTokenStmt.run(token, job.id, weight);
      });
    });
    
    transaction();
  }

  /**
   * Delete stale jobs
   */
  async deleteStaleJobs(days: number = 30): Promise<number> {
    if (dbManager.isUsingSupabase()) {
      return jobServiceSupabase.deleteStaleJobs(days);
    }
    
    const cutoffDate = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const stmt = dbManager.prepare('DELETE FROM jobs WHERE posted_date < ?');
    const result = stmt.run(cutoffDate);
    return result.changes;
  }

  /**
   * Deduplicate jobs based on title + company + location hash
   */
  async deduplicateJobs(): Promise<number> {
    if (dbManager.isUsingSupabase()) {
      return jobServiceSupabase.deduplicateJobs();
    }
    
    const db = dbManager.getDB();
    
    // Find duplicates and keep the newest one
    const findDuplicatesStmt = db.prepare(`
      SELECT title_normalized, company_domain, location_normalized, COUNT(*) as cnt
      FROM jobs
      GROUP BY title_normalized, company_domain, location_normalized
      HAVING cnt > 1
    `);
    
    const duplicates = findDuplicatesStmt.all() as { 
      title_normalized: string; 
      company_domain: string; 
      location_normalized: string; 
    }[];
    
    let deletedCount = 0;
    
    for (const dup of duplicates) {
      const findOldestStmt = db.prepare(`
        SELECT id FROM jobs
        WHERE title_normalized = ? AND company_domain = ? AND location_normalized = ?
        ORDER BY posted_date ASC
        LIMIT -1 OFFSET 1
      `);
      
      const oldestJobs = findOldestStmt.all(
        dup.title_normalized,
        dup.company_domain,
        dup.location_normalized
      ) as { id: string }[];
      
      for (const job of oldestJobs) {
        const deleteStmt = db.prepare('DELETE FROM jobs WHERE id = ?');
        deleteStmt.run(job.id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Recalculate ranking scores for all jobs
   */
  async recalculateRankingScores(): Promise<void> {
    if (dbManager.isUsingSupabase()) {
      return jobServiceSupabase.recalculateRankingScores();
    }
    
    const db = dbManager.getDB();
    const getAllJobsStmt = db.prepare('SELECT * FROM jobs');
    const jobs = getAllJobsStmt.all() as Job[];
    
    for (const job of jobs) {
      try {
        const tokenWeights = tokenizer.tokenizeJob(job);
        const rankingScore = await rankingEngine.calculateRankingScore(job, tokenWeights);
        await rankingEngine.updateJobRanking(job.id, rankingScore);
      } catch (error) {
        console.error(`Error recalculating ranking for job ${job.id}:`, error);
      }
    }
  }

  /**
   * Normalize job fields
   */
  normalizeJobFields(job: Job): Job {
    return {
      ...job,
      title_normalized: job.title.toLowerCase().trim(),
      company_domain: job.company_domain || this.extractDomain(job.company),
      location_normalized: job.location.toLowerCase().trim(),
      remote: job.remote || this.isRemoteLocation(job.location)
    };
  }

  private extractDomain(company: string): string {
    return company.toLowerCase().replace(/\s+/g, '') + '.com';
  }

  private isRemoteLocation(location: string): boolean {
    return location.toLowerCase().includes('remote') || 
           location.toLowerCase().includes('anywhere') ||
           location.toLowerCase().includes('distributed');
  }
}

export const jobService = new JobService();