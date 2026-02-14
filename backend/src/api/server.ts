import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// Load environment variables
dotenv.config();
// Import services
import { searchService } from '../services/searchService';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../monitoring/logger';
// Import routes
import matchRoutes from './routes/match';
import resumeImproveRoutes from './routes/resumeImprove';
import personalizationRoutes from './routes/personalization';
import recruiterRoutes from './routes/recruiter';
import resumeUploadRoutes from './routes/resumeUpload';
import healthCheckRoutes from '../monitoring/healthCheck';
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
// ✅ CORS - Allow frontend domains
const normalizeOrigins = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
};

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nextjob-frontend.onrender.com',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const allowedOrigins = new Set([
  ...defaultOrigins,
  ...normalizeOrigins(process.env.FRONTEND_URL),
  ...normalizeOrigins(process.env.CORS_ORIGINS),
  ...normalizeOrigins(process.env.ALLOWED_ORIGINS)
]);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
// Compression
app.use(compression());
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// Initialize Supabase if available
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log('✅ Supabase client initialized');
}
// Health check
app.use('/health', healthCheckRoutes);
// Search endpoint
app.get('/jobs', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      keyword = '',
      location = '',
      remote,
      page = '1',
      limit = '20'
    } = req.query;
    const searchParams = {
      keyword: keyword as string,
      location: location as string,
      remote: remote !== undefined ? remote === 'true' : undefined,
      page: parseInt(page as string, 10) || 1,
      limit: Math.min(parseInt(limit as string, 10) || 20, 100)
    };
    const startTime = Date.now();
    const result = await searchService.search(searchParams);
    const duration = Date.now() - startTime;
    res.status(200).json({
      ...result,
      performance: {
        duration_ms: duration,
        cached: duration < 10
      }
    });
  } catch (error) {
    logger.error('Search error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Analytics endpoints
app.get('/stats/trending', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const trending = await analyticsService.getTrendingSkills(Math.min(days, 30));
    res.status(200).json(trending);
  } catch (error) {
    logger.error('Trending stats error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/stats/remote-ratio', async (req: Request, res: Response): Promise<void> => {
  try {
    const ratio = await analyticsService.getRemoteRatio();
    res.status(200).json(ratio);
  } catch (error) {
    logger.error('Remote ratio error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/stats/top-companies', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const companies = await analyticsService.getTopCompanies(Math.min(limit, 100));
    res.status(200).json(companies);
  } catch (error) {
    logger.error('Top companies error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/stats/location-growth', async (req: Request, res: Response): Promise<void> => {
  try {
    const growth = await analyticsService.getLocationGrowth();
    res.status(200).json(growth);
  } catch (error) {
    logger.error('Location growth error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Cache management (admin)
app.post('/admin/cache/clear', (req: Request, res: Response): void => {
  try {
    searchService.clearCache();
    res.status(200).json({ message: 'Cache cleared' });
  } catch (error) {
    logger.error('Cache clear error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Resume routes
app.use('/match', matchRoutes);
app.use('/resume-improve', resumeImproveRoutes);
app.use('/personalization', personalizationRoutes);
app.use('/recruiter', recruiterRoutes);
app.use('/resume/upload', resumeUploadRoutes);
// Home route
app.get('/', (req, res) => {
  res.json({
    name: 'NextJob API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      jobs: '/jobs',
      stats: '/stats/*',
      match: '/match',
      personalize: '/personalization',
      recruiter: '/recruiter'
    }
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Error occurred', { error: err });
  res.status(500).json({ error: 'Internal server error' });
});
// Start server
app.listen(PORT, () => {
  logger.info('JobDone API server running', { port: PORT });
  console.log(`✅ NextJob API server running on port ${PORT}`);
  console.log(`🔗 Allowed CORS origins: ${Array.from(allowedOrigins).join(', ')}`);
});
export default app;
