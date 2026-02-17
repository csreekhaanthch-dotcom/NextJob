import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { config } from './config';
import { logger } from './utils/logger';
import { requestLogger } from './middlewares/loggingMiddleware';
import { compressionMiddleware } from './middlewares/compressionMiddleware';
import { cacheMiddleware } from './middlewares/cacheMiddleware';
import { securityHeaders, rateLimiter, configureCors, validateSearchParams } from './middlewares/securityMiddleware';
import { JobsController } from './controllers/jobsController';
import healthRoutes from './routes/healthRoutes';

const app = express();

logger.info('Starting backend server with configuration:', {
  port: config.server.port,
  nodeEnv: config.server.nodeEnv
});

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter);
app.use(configureCors());

// Compression middleware
app.use(compressionMiddleware);

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache middleware for performance
app.use(cacheMiddleware);

// Health check routes
app.use('/health', healthRoutes);

// API routes
app.get('/api/jobs', validateSearchParams, JobsController.searchJobs);
app.get('/api/jobs/:id', JobsController.getJobById);

// Root endpoint
app.get('/', (req, res) => {
  logger.info('Root endpoint requested');
  res.json({ 
    message: 'NextJob API Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', { url: req.originalUrl });
  res.status(404).json({ 
    error: 'Not found', 
    message: 'The requested resource was not found' 
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error', { error: err.stack || err.message });
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    error: 'Internal server error', 
    message: 'An unexpected error occurred' 
  });
});

// Start server
const server = app.listen(config.server.port, '0.0.0.0', () => {
  logger.info(`NextJob backend server listening at http://0.0.0.0:${config.server.port}`);
  logger.info(`Health check available at http://0.0.0.0:${config.server.port}/health`);
}).on('error', (error) => {
  logger.error('Server failed to start', { error });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});