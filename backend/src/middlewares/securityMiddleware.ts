import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '../utils/logger';

// Rate limiting middleware with stricter limits
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit to 50 requests per window
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/'
});

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Input validation middleware with Zod schemas
export const validateSearchParams = (req: Request, res: Response, next: NextFunction): void => {
  const { search, location, page, limit } = req.query;
  
  // Validate and sanitize inputs
  if (page && (isNaN(Number(page)) || Number(page) < 1 || Number(page) > 100)) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Page must be between 1 and 100'
    });
  }
  
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 50)) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Limit must be between 1 and 50'
    });
  }
  
  // Sanitize string inputs
  if (search && typeof search === 'string' && search.length > 100) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Search term too long'
    });
  }
  
  if (location && typeof location === 'string' && location.length > 100) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: 'Location term too long'
    });
  }
  
  next();
};

// CORS configuration with strict production settings
export const configureCors = () => {
  const cors = require('cors');
  
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    
    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200
    };
    
    logger.info('Production CORS configured with origins:', allowedOrigins);
    return cors(corsOptions);
  } else {
    logger.info('Development CORS enabled (all origins allowed)');
    return cors({
      origin: true,
      credentials: true
    });
  }
};