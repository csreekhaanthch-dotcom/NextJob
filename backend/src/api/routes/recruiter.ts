import express from 'express';
import { recruiterMatchingService } from '../../services/recruiterMatchingService';
import { recruiterDashboardService } from '../../services/recruiterDashboardService';
import { requireRecruiter, AuthRequest } from '../../middleware/auth';
import { dbManager } from '../../database/connection';

const router = express.Router();

/**
 * POST /match-candidates
 * Match job description to candidates (recruiter only)
 */
router.post('/match-candidates', requireRecruiter, async (req: AuthRequest, res) => {
  try {
    const { jobId, jobDescription, jobTitle, jobLocation, limit } = req.body;
    
    // Validate required parameters
    if (!jobId || !jobDescription || !jobTitle || !jobLocation) {
      return res.status(400).json({ 
        error: 'jobId, jobDescription, jobTitle, and jobLocation are required' 
      });
    }
    
    const startTime = Date.now();
    
    // Match job to candidates
    const matches = await recruiterMatchingService.matchJobToCandidates(
      jobId,
      jobDescription,
      jobTitle,
      jobLocation,
      limit ? parseInt(limit as string, 10) : undefined
    );
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      matches,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Candidate matching error:', error);
    res.status(500).json({ error: 'Internal server error during candidate matching' });
  }
});

/**
 * GET /dashboard
 * Get recruiter dashboard data (recruiter only)
 */
router.get('/dashboard', requireRecruiter, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get recruiter ID from user ID
    const db = dbManager.getDB();
    const recruiterStmt = db.prepare('SELECT id FROM recruiters WHERE user_id = ?');
    const recruiterResult = recruiterStmt.get(req.user.id) as { id: string } | undefined;
    
    if (!recruiterResult) {
      return res.status(403).json({ error: 'Not registered as recruiter' });
    }
    
    const startTime = Date.now();
    
    // Get dashboard data
    const dashboardData = await recruiterDashboardService.getDashboardData(recruiterResult.id);
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      ...dashboardData,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error retrieving dashboard data' });
  }
});

export default router;