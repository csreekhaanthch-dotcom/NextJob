import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { searchService } from '../services/searchService';
import { analyticsService } from '../services/analyticsService';
import matchRoutes from './routes/match';
import resumeImproveRoutes from './routes/resumeImprove';
import personalizationRoutes from './routes/personalization';
import recruiterRoutes from './routes/recruiter';
import resumeUploadRoutes from './routes/resumeUpload';
import healthCheckRoutes from '../monitoring/healthCheck';
import { corsOptions, limiter, strictLimiter, resumeUploadLimiter } from '../middleware/security';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(cors(corsOptions));

// Rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.use('/health', healthCheckRoutes);

// Search endpoint
app.get('/jobs', async (req, res) => {
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
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100) // Cap at 100
    };
    
    // Validate parameters
    if (searchParams.page < 1) searchParams.page = 1;
    if (searchParams.limit < 1) searchParams.limit = 20;
    
    const startTime = Date.now();
    const result = await searchService.search(searchParams);
    const duration = Date.now() - startTime;
    
    // Add performance metrics to response
    res.status(200).json({
      ...result,
      performance: {
        duration_ms: duration,
        cached: duration < 10 // Assume cached if < 10ms
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
app.get('/stats/trending', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const trending = await analyticsService.getTrendingSkills(Math.min(days, 30));
    res.status(200).json(trending);
  } catch (error) {
    console.error('Trending stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats/remote-ratio', async (req, res) => {
  try {
    const ratio = await analyticsService.getRemoteRatio();
    res.status(200).json(ratio);
  } catch (error) {
    console.error('Remote ratio error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats/top-companies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const companies = await analyticsService.getTopCompanies(Math.min(limit, 100));
    res.status(200).json(companies);
  } catch (error) {
    console.error('Top companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stats/location-growth', async (req, res) => {
  try {
    const growth = await analyticsService.getLocationGrowth();
    res.status(200).json(growth);
  } catch (error) {
    console.error('Location growth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cache management endpoint (admin only)
app.post('/admin/cache/clear', (req, res) => {
  try {
    searchService.clearCache();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume matching endpoint
app.use('/match', matchRoutes);

// Resume improvement endpoint
app.use('/resume-improve', resumeImproveRoutes);

// Personalization endpoints
app.use('/personalization', personalizationRoutes);

// Recruiter endpoints
app.use('/recruiter', recruiterRoutes);

// Resume upload endpoint
app.use('/resume/upload', resumeUploadRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  // Log error for debugging (in production, use a proper logging solution)
  console.error('Error occurred:', err);
  
  // Don't expose internal error details to client
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`JobDone API server running on port ${PORT}`);
});

export default app;