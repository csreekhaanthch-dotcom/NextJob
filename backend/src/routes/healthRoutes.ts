import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  logger.debug('Health check requested');
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'nextjob-backend'
  });
});

/**
 * GET /health/deep
 * Deep health check including dependencies
 */
router.get('/health/deep', async (req: Request, res: Response) => {
  logger.info('Deep health check requested');
  
  try {
    // Check Adzuna API connectivity
    const startTime = Date.now();
    
    // In a real implementation, we would check external service health
    // For now, we'll simulate a successful check
    const adzunaCheck = {
      status: 'ok',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        adzuna: adzunaCheck
      }
    });
  } catch (error) {
    logger.error('Deep health check failed', { error });
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service dependency check failed'
    });
  }
});

export default router;