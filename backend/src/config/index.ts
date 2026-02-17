import { EnvironmentValidator } from '../utils/environmentValidator';
import { logger } from '../utils/logger';

// Validate environment at startup
EnvironmentValidator.validateAtStartup();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL
  },
  api: {
    adzuna: {
      appId: process.env.ADZUNA_APP_ID!,
      appKey: process.env.ADZUNA_APP_KEY!
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '60', 10)
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  }
};

logger.info('Configuration loaded', { 
  serverPort: config.server.port,
  nodeEnv: config.server.nodeEnv,
  cacheTtl: config.cache.ttl
});