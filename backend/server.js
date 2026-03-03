require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const jobScraper = require('./scraper');
const { 
  initializeSchema, 
  searchJobs, 
  getJobCount, 
  getCompanies, 
  getSources,
  upsertJobs 
} = require('./src/database/connection');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
initializeSchema();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const searchSchema = Joi.object({
  search: Joi.string().allow('', null).max(200),
  location: Joi.string().allow('', null).max(200),
  page: Joi.number().min(1).max(100).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().allow('', null),
  skills: Joi.array().items(Joi.string()).single(),
  jobType: Joi.array().items(Joi.string()).single(),
  experienceLevel: Joi.array().items(Joi.string()).single(),
  datePosted: Joi.string().allow('', null),
  sources: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  useATS: Joi.string().valid('true', 'false'),
  useCustom: Joi.string().valid('true', 'false'),
  useCache: Joi.string().valid('true', 'false').default('true'),
}).unknown(true);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const totalJobs = getJobCount();
    const companies = getCompanies();
    const sources = getSources();
    
    res.json({
      totalJobs,
      companyCount: companies.length,
      companies: companies.slice(0, 50), // Top 50 companies
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Main jobs endpoint - with database integration
app.get('/api/jobs', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.details });
    }

    const { 
      search, 
      location, 
      page = 1, 
      limit = 20, 
      sources, 
      useATS = 'true', 
      useCustom = 'true',
      useCache = 'true'
    } = value;

    let allJobs = [];
    
    // Try to get jobs from cache first
    if (useCache === 'true') {
      try {
        const cachedJobs = searchJobs({
          query: search || '',
          location: location || '',
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit)
        });
        
        if (cachedJobs.length > 0) {
          console.log(`[API] Serving ${cachedJobs.length} jobs from cache`);
          allJobs = cachedJobs;
        }
      } catch (dbError) {
        console.warn('[API] Cache query failed, falling back to live fetch:', dbError.message);
      }
    }
    
    // If no cached jobs or cache disabled, fetch live
    if (allJobs.length === 0) {
      // Parse sources parameter
      let sourcesArray = ['remotive', 'arbeitnow', 'greenhouse', 'lever', 'remoteok', 'usajobs'];
      if (sources) {
        if (typeof sources === 'string') {
          sourcesArray = sources.split(',').map(s => s.trim());
        } else if (Array.isArray(sources)) {
          sourcesArray = sources;
        }
      }

      const liveJobs = await jobScraper.fetchAllJobs({
        query: search || '',
        location: location || '',
        page: parseInt(page),
        sources: sourcesArray,
        useATS: useATS !== 'false',
        useCustom: useCustom !== 'false',
        priority: 2,
      });

      // Cache the fetched jobs
      if (liveJobs.length > 0) {
        try {
          upsertJobs(liveJobs);
          console.log(`[API] Cached ${liveJobs.length} jobs`);
        } catch (cacheError) {
          console.warn('[API] Failed to cache jobs:', cacheError.message);
        }
      }

      allJobs = liveJobs.map(job => ({
        ...job,
        posted_date: job.posted_at ? new Date(job.posted_at).getTime() / 1000 : Date.now() / 1000,
      }));
    }

    // Calculate pagination
    const total = allJobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (parseInt(page) - 1) * limit;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);

    // Return format expected by frontend
    res.json({
      jobs: paginatedJobs,
      total: total,
      page: parseInt(page),
      totalPages: totalPages,
      source: useCache === 'true' && allJobs.length > 0 ? 'cache' : 'live'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST endpoint for searching with large profiles
app.post('/api/jobs', async (req, res) => {
  try {
    const { 
      search, 
      location, 
      page = 1, 
      limit = 20,
      profile,
      ...otherFilters
    } = req.body;

    // Use GET handler logic
    const queryParams = {
      search: search || '',
      location: location || '',
      page: page.toString(),
      limit: limit.toString(),
      ...otherFilters
    };
    
    req.query = queryParams;
    
    // Forward to GET handler
    return app._router.handle(req, res, () => {});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'NextJob API', 
    version: '2.0.0',
    description: 'Job board aggregator with ATS scrapers for 100+ companies',
    endpoints: {
      health: '/health',
      jobs: '/api/jobs',
      stats: '/api/stats',
      sources: '/api/sources',
      atsSources: '/api/ats-sources'
    }
  });
});

// Get available sources
app.get('/api/sources', (req, res) => {
  try {
    const sources = jobScraper.getAvailableSources();
    const dbSources = getSources();
    
    res.json({ 
      sources,
      database: dbSources,
      totalCached: dbSources.reduce((sum, s) => sum + s.job_count, 0)
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Get ATS company information
app.get('/api/ats-sources', (req, res) => {
  try {
    const atsSources = jobScraper.getATSSources();
    res.json({ atsSources });
  } catch (error) {
    console.error('Error fetching ATS sources:', error);
    res.status(500).json({ error: 'Failed to fetch ATS sources' });
  }
});

// Trigger manual scrape (admin endpoint)
app.post('/api/admin/scrape', async (req, res) => {
  try {
    const { secret, sources = ['greenhouse', 'lever', 'job_boards'] } = req.body;
    
    // Simple secret check (use proper auth in production)
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Admin] Starting manual scrape...');
    
    const results = {
      greenhouse: 0,
      lever: 0,
      jobBoards: 0,
      errors: []
    };

    // Scrape Greenhouse
    if (sources.includes('greenhouse')) {
      try {
        const { greenhouseScraper } = require('./src/scrapers/greenhouse');
        const jobs = await greenhouseScraper.fetchAllJobs({ priority: 2 });
        const { added, updated } = upsertJobs(jobs);
        results.greenhouse = added + updated;
        console.log(`[Admin] Greenhouse: ${results.greenhouse} jobs`);
      } catch (err) {
        results.errors.push(`Greenhouse: ${err.message}`);
      }
    }

    // Scrape Lever
    if (sources.includes('lever')) {
      try {
        const { leverScraper } = require('./src/scrapers/lever');
        const jobs = await leverScraper.fetchAllJobs({ priority: 2 });
        const { added, updated } = upsertJobs(jobs);
        results.lever = added + updated;
        console.log(`[Admin] Lever: ${results.lever} jobs`);
      } catch (err) {
        results.errors.push(`Lever: ${err.message}`);
      }
    }

    // Scrape job boards
    if (sources.includes('job_boards')) {
      try {
        const jobs = await jobScraper.fetchAllJobs({
          sources: ['remotive', 'arbeitnow', 'remoteok', 'usajobs'],
          useATS: false,
        });
        const { added, updated } = upsertJobs(jobs);
        results.jobBoards = added + updated;
        console.log(`[Admin] Job Boards: ${results.jobBoards} jobs`);
      } catch (err) {
        results.errors.push(`Job Boards: ${err.message}`);
      }
    }

    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to run scraper' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`  NextJob API Server v2.0.0`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Database: Connected`);
  console.log(`  ATS Scrapers: Enabled (100+ companies)`);
  console.log(`═══════════════════════════════════════════════════`);
});

module.exports = app;
