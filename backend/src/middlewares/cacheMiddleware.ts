import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

// Create cache instance with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

interface CacheKey {
  search?: string;
  location?: string;
  page?: number;
}

const generateCacheKey = (params: CacheKey): string => {
  return `jobs:${params.search || 'software'}:${params.location || 'United States'}:${params.page || 1}`;
};

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only cache GET requests to /api/jobs
  if (req.method !== 'GET' || req.path !== '/api/jobs') {
    return next();
  }

  const cacheKey = generateCacheKey({
    search: req.query.search as string,
    location: req.query.location as string,
    page: req.query.page ? parseInt(req.query.page as string) : undefined
  });

  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse) {
    logger.info('Cache hit', { cacheKey });
    return res.json(cachedResponse);
  }

  // Override res.json to cache the response
  const originalJson = res.json;
  res.json = function(body: any) {
    // Cache successful responses only
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(cacheKey, body);
      logger.info('Cached response', { cacheKey });
    }
    return originalJson.call(this, body);
  };

  next();
};