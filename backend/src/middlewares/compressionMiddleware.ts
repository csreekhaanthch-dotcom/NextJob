import compression from 'compression';
import { Request, Response } from 'express';

export const compressionMiddleware = compression({
  // Compress all responses over 1KB
  threshold: 1024,
  // Filter out already compressed responses
  filter: (req: Request, res: Response) => {
    // Don't compress images or already compressed responses
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter function
    return compression.filter(req, res);
  }
});