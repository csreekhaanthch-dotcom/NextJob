import express from 'express';
import { resumeParser } from '../../core/resumeParser';
import { matchingService } from '../../services/matchingService';
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
 * POST /match
 * Match resume against jobs
 */
router.post('/', upload.single('resume'), async (req, res): Promise<void> => {
  try {
    // Validate request
    if (!req.file) {
      res.status(400).json({ error: 'Resume file is required' });
      return;
    }

    const startTime = Date.now();
    
    // Parse resume
    const resumeText = await resumeParser.parse(req.file.buffer, req.file.mimetype);
    const normalizedText = resumeParser.normalizeText(resumeText);
    
    // Match resume against jobs
    const matches = await matchingService.matchResume(normalizedText);
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      matches,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Resume matching error:', error);
    res.status(500).json({ error: 'Internal server error during resume matching' });
  }
});

/**
 * POST /match/text
 * Match plain text resume against jobs
 */
router.post('/text', async (req, res): Promise<void> => {
  try {
    const { resume } = req.body;
    
    // Validate request
    if (!resume || typeof resume !== 'string') {
      res.status(400).json({ error: 'Resume text is required' });
      return;
    }

    const startTime = Date.now();
    
    // Normalize resume text
    const normalizedText = resumeParser.normalizeText(resume);
    
    // Match resume against jobs
    const matches = await matchingService.matchResume(normalizedText);
    
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      matches,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error) {
    console.error('Resume matching error:', error);
    res.status(500).json({ error: 'Internal server error during resume matching' });
  }
});

export default router;