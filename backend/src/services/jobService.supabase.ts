import { supabaseManager } from '../database/supabaseConnection';
import { Job, JobToken } from '../core/types';
import { tokenizer } from '../core/tokenizer';
import { rankingEngine } from '../core/ranking';

class JobServiceSupabase {
  
  async upsertJob(job: Job): Promise<void> {
    const supabase = supabaseManager.getClient();
    
    try {
      // Upsert job
      const { error: jobError } = await supabase
        .from('jobs')
        .upsert({
          id: job.id,
          title: job.title,
          title_normalized: job.title_normalized,
          company: job.company,
          company_domain: job.company_domain,
          location: job.location,
          location_normalized: job.location_normalized,
          remote: job.remote,
          posted_date: job.posted_date,
          ranking_score: job.ranking_score || 0,
          source: job.source,
          job_url: job.job_url,
          description: job.description || null,
          salary: job.salary || null,
          tags: job.tags ? JSON.stringify(job.tags) : null,
          updated_at: new Date().toISOString()
        });
      
      if (jobError) {
        throw jobError;
      }
      
      // Delete existing tokens for this job
      const { error: deleteError } = await supabase
        .from('job_tokens')
        .delete()
        .eq('job_id', job.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Tokenize job and insert tokens
      const tokenWeights = tokenizer.tokenizeJob(job);
      const tokens = Object.entries(tokenWeights).map(([token, weight]) => ({
        token,
        job_id: job.id,
        weight
      }));
      
      // Insert tokens in batches
      for (const token of tokens) {
        const { error: tokenError } = await supabase
          .from('job_tokens')
          .insert(token);
        
        if (tokenError) {
          console.error(`Failed to insert token ${token.token}:`, tokenError.message);
        }
      }
      
    } catch (error) {
      console.error('Error upserting job:', error);
      throw error;
    }
  }

  async deleteStaleJobs(days: number = 30): Promise<number> {
    const supabase = supabaseManager.getClient();
    const cutoffDate = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    
    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .lt('posted_date', cutoffDate)
      .select();
    
    if (error) {
      console.error('Error deleting stale jobs:', error.message);
      return 0;
    }
    
    return data ? data.length : 0;
  }

  async deduplicateJobs(): Promise<number> {
    const supabase = supabaseManager.getClient();
    
    // Supabase doesn't support complex deduplication in a single query like SQLite
    // We'll need to implement this differently
    
    // For now, return 0 as this is a complex operation that needs redesign for Supabase
    console.warn('Deduplication not yet implemented for Supabase');
    return 0;
  }

  async recalculateRankingScores(): Promise<void> {
    const supabase = supabaseManager.getClient();
    
    // Get all jobs
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*');
    
    if (error) {
      console.error('Error fetching jobs for ranking:', error.message);
      return;
    }
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found for ranking recalculation');
      return;
    }
    
    // Process each job
    for (const job of jobs) {
      try {
        const tokenWeights = tokenizer.tokenizeJob(job);
        const rankingScore = await rankingEngine.calculateRankingScore(job, tokenWeights);
        
        // Update job ranking
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ ranking_score: rankingScore })
          .eq('id', job.id);
        
        if (updateError) {
          console.error(`Error updating ranking for job ${job.id}:`, updateError.message);
        }
      } catch (error) {
        console.error(`Error recalculating ranking for job ${job.id}:`, error);
      }
    }
  }

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

export const jobServiceSupabase = new JobServiceSupabase();