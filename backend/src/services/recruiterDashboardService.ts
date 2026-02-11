import { dbManager } from '../database/connection';

class RecruiterDashboardService {
  /**
   * Get recruiter dashboard data
   */
  async getDashboardData(recruiterId: string): Promise<any> {
    const db = dbManager.getDB();
    
    // Get total candidates in the system
    const totalCandidatesStmt = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM resumes');
    const totalCandidatesResult = totalCandidatesStmt.get() as { count: number };
    
    // Get recent matches for this recruiter
    const recentMatchesStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM recruiter_candidate_matches 
      WHERE recruiter_id = ? 
      AND created_at > datetime('now', '-7 days')
    `);
    const recentMatchesResult = recentMatchesStmt.get(recruiterId) as { count: number };
    
    // Get top skills from recent matches
    const topSkillsStmt = db.prepare(`
      SELECT r.file_path, u.id as user_id
      FROM recruiter_candidate_matches rcm
      JOIN recruiters r ON rcm.recruiter_id = r.id
      JOIN users u ON rcm.user_id = u.id
      WHERE rcm.recruiter_id = ?
      ORDER BY rcm.score DESC
      LIMIT 20
    `);
    
    // This is a simplified version - in a real implementation, you'd extract skills from resumes
    const topSkills = ["JavaScript", "React", "Node.js", "AWS", "Docker", "Python", "Java", "TypeScript"];
    
    // Get location distribution
    const locationDistributionStmt = db.prepare(`
      SELECT location, COUNT(*) as count
      FROM jobs
      WHERE company_id IN (
        SELECT company_id 
        FROM recruiters 
        WHERE id = ?
      )
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `);
    const locationDistribution = locationDistributionStmt.all(recruiterId);
    
    return {
      total_candidates: totalCandidatesResult.count,
      recent_matches: recentMatchesResult.count,
      top_skills: topSkills,
      location_distribution: locationDistribution
    };
  }
}

export const recruiterDashboardService = new RecruiterDashboardService();