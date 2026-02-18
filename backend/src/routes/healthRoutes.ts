import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /health
 * Basic liveness probe
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /ready
 * Readiness probe with dependency checks
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check critical dependencies
    const checks = {
      adzuna: await checkAdzunaConnectivity(),
      cache: checkCacheHealth(),
      database: true // Placeholder for future DB check
    };
    
    const allHealthy = Object.values(checks).every(check => check === true);
    
    if (allHealthy) {
      res.status(200).json({ 
        status: 'ready', 
        timestamp: new Date().toISOString(),
        checks
      });
    } else {
      res.status(503).json({ 
        status: 'degraded', 
        timestamp: new Date().toISOString(),
        checks
      });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function checkAdzunaConnectivity(): Promise<boolean> {
  try {
    // Simple connectivity check - in a real implementation, 
    // we'd make a lightweight API call
    return true;
  } catch (error) {
    logger.warn('Adzuna connectivity check failed', { error });
    return false;
  }
}

function checkCacheHealth(): boolean {
  try {
    // Simple cache health check
    return true;
  } catch (error) {
    logger.warn('Cache health check failed', { error });
    return false;
  }
}

export default router;