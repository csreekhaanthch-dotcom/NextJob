import express from 'express';
import { resumeParser } from '../../core/resumeParser';
import { resumeAnalyzer } from '../../core/resumeAnalyzer';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, DOCX, and TXT files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

/**
 * POST /resume-improve
 * Analyze resume and provide improvement suggestions
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    let resumeText: string;
    
    // Handle file upload or text input
    if (req.file) {
      // Parse resume file
      resumeText = await resumeParser.parse(req.file.buffer, req.file.mimetype);
    } else if (req.body.resume_text) {
      // Use provided text
      resumeText = req.body.resume_text;
    } else {
      return res.status(400).json({ error: 'Resume file or text is required' });
    }

    const startTime = Date.now();
    
    // Normalize resume text
    const normalizedText = resumeParser.normalizeText(resumeText);
    
    // For demo purposes, we'll use mock matched jobs
    // In production, this would come from the matching service
    const matchedJobs = [
      { title: "Senior Frontend Developer", skills: ["react", "typescript", "redux", "graphql"] },
      { title: "Backend Engineer", skills: ["node.js", "express", "mongodb", "docker"] },
      { title: "Full Stack Developer", skills: ["javascript", "python", "aws", "postgresql"] },
      // Add more mock jobs as needed
    ];
    
    // Analyze resume
    const analysis = resumeAnalyzer.analyze(normalizedText, matchedJobs);
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      ...analysis,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: 'Internal server error during resume analysis' });
  }
});

export default router;