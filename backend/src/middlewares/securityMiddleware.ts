import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '../utils/logger';

/**
 * Security middleware configuration
 */

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/';
  }
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"]
    }
  },
  dnsPrefetchControl: true,
  frameguard: {
    action: 'deny'
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  xssFilter: true
});

// Input validation middleware
export const validateSearchParams = (req: Request, res: Response, next: NextFunction) => {
  const { search, location, page, limit } = req.query;
  
  // Validate page parameter
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Page must be a positive integer'
    });
  }
  
  // Validate limit parameter
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Limit must be between 1 and 100'
    });
  }
  
  // Sanitize search and location parameters
  if (search && typeof search !== 'string') {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Search must be a string'
    });
  }
  
  if (location && typeof location !== 'string') {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Location must be a string'
    });
  }
  
  next();
};

// CORS configuration
export const configureCors = () => {
  const cors = require('cors');
  
  if (process.env.NODE_ENV === 'production') {
    // In production, only allow requests from the frontend domain
    const corsOptions = {
      origin: process.env.FRONTEND_URL || 'https://your-frontend.onrender.com',
      credentials: true,
      optionsSuccessStatus: 200
    };
    logger.info('Production CORS enabled for origin:', corsOptions.origin);
    return cors(corsOptions);
  } else {
    // In development, allow all origins but with security headers
    logger.info('Development CORS enabled (all origins allowed)');
    return cors({
      origin: true,
      credentials: true
    });
  }
};