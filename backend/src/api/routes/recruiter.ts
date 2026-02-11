import express from 'express';
import { recruiterMatchingService } from '../../services/recruiterMatchingService';

const router = express.Router();

/**
 * POST /match-candidates
 * Match job description to candidates
 */
router.post('/match-candidates', async (req, res) => {
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
      jobId as string,
      jobDescription as string,
      jobTitle as string,
      jobLocation as string,
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
 * GET /candidate/:userId
 * Get detailed candidate information
 */
router.get('/candidate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, this would fetch detailed candidate info
    // For now, we'll return a placeholder response
    
    res.status(200).json({
      user_id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      current_company: "Tech Corp",
      current_title: "Senior Software Engineer",
      experience_years: 5,
      education: "B.S. Computer Science, Stanford University",
      skills: ["JavaScript", "React", "Node.js", "AWS", "Docker"],
      resume_url: "/resumes/john-doe.pdf"
    });
  } catch (error) {
    console.error('Candidate info error:', error);
    res.status(500).json({ error: 'Internal server error retrieving candidate info' });
  }
});

export default router;