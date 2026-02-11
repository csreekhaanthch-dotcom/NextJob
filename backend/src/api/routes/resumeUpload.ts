import express from 'express';
import multer from 'multer';
import { storageService } from '../../services/storageService';
import { dbManager } from '../../database/connection';

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
 * POST /resume/upload
 * Upload resume file and save metadata to database
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    // Validate required parameters
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Extract user ID from request (assuming it's passed in header or JWT)
    const userId = req.headers['user-id'] as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const startTime = Date.now();

    // Upload file to Supabase Storage
    const uploadResult = await storageService.uploadResume(
      userId,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save metadata to database
    const db = dbManager.getDB();
    const stmt = db.prepare(`
      INSERT INTO resumes (user_id, file_path, file_size, file_type, uploaded_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT (user_id) DO UPDATE SET
        file_path = EXCLUDED.file_path,
        file_size = EXCLUDED.file_size,
        file_type = EXCLUDED.file_type,
        uploaded_at = datetime('now')
    `);

    stmt.run(
      userId,
      uploadResult.filePath,
      req.file.size,
      req.file.mimetype
    );

    const duration = Date.now() - startTime;

    res.status(200).json({
      message: 'Resume uploaded successfully',
      file_path: uploadResult.filePath,
      url: uploadResult.url,
      performance: {
        duration_ms: duration
      }
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during resume upload' });
  }
});

export default router;