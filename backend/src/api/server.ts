import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Import routes
import { healthRouter } from '../monitoring/healthCheck';
import { matchRouter } from './routes/match';
import { personalizationRouter } from './routes/personalization';
import { recruiterRouter } from './routes/recruiter';
import { resumeImproveRouter } from './routes/resumeImprove';
import { resumeUploadRouter } from './routes/resumeUpload';
import { jobRoutes } from './routes/jobs';
import { authMiddleware } from '../middleware/auth';
// Import services
import { createClient } from '@supabase/supabase-js';
import { DatabaseManager } from '../database/connection';
import { JobService } from '../services/jobService';
import { SearchService } from '../services/searchService';
import { MatchingService } from '../services/matchingService';
import { AnalyticsService } from '../services/analyticsService';
import { PersonalizationService } from '../services/personalizationService';
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
// ✅ CORS FIX - Allow frontend domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nextjob-frontend.onrender.com',
  'https://nextjob-frontend.onrender.com/',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
// Compression middleware
app.use(compression());
// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// Initialize database and services
let dbManager: DatabaseManager | null = null;
let jobService: JobService | null = null;
let searchService: SearchService | null = null;
let matchingService: MatchingService | null = null;
let analyticsService: AnalyticsService | null = null;
let personalizationService: PersonalizationService | null = null;
// Initialize Supabase if credentials exist
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log('✅ Supabase client initialized');
}
// Initialize SQLite for local development if Supabase not available
try {
  dbManager = new DatabaseManager();
  console.log('✅ Database manager initialized');
  
  jobService = new JobService(dbManager);
  searchService = new SearchService(dbManager);
  matchingService = new MatchingService(dbManager);
  analyticsService = new AnalyticsService(dbManager);
  personalizationService = new PersonalizationService(dbManager);
  
  console.log('✅ Services initialized');
} catch (error) {
  console.warn('⚠️  Database initialization warning:', error.message);
  console.log('Continuing without local database...');
}
// Health check route
app.use('/health', healthRouter);
// Public routes
app.use('/jobs', jobRoutes);
// Protected routes
app.use('/match', authMiddleware, matchRouter);
app.use('/personalize', authMiddleware, personalizationRouter);
app.use('/recruiter', authMiddleware, recruiterRouter);
app.use('/improve-resume', authMiddleware, resumeImproveRouter);
app.use('/upload-resume', authMiddleware, resumeUploadRouter);
// API info route
app.get('/', (req, res) => {
  res.json({
    name: 'NextJob API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      jobs: '/jobs',
      match: '/match',
      personalize: '/personalize',
      recruiter: '/recruiter'
    }
  });
});
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
// Start server
app.listen(PORT, () => {
  console.log(`✅ NextJob API server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
export default app;
