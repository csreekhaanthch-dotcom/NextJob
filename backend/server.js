const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const winston = require('winston');
const Joi = require('joi');

dotenv.config();

// Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'nextjob-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => 
          `${timestamp} [${level}]: ${message}`)
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Input Validation Schema
const jobsQuerySchema = Joi.object({
  search: Joi.string().max(200).trim().allow('').default(''),
  location: Joi.string().max(200).trim().allow('').default(''),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12)
});

// Bounded LRU Cache
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

class BoundedCache {
  constructor(maxSize = 100, ttl = CACHE_TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) { this.stats.misses++; return null; }
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    this.stats.hits++;
    return item.data;
  }
  set(key, data) {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

const cache = new BoundedCache(MAX_CACHE_SIZE, CACHE_TTL);
setInterval(() => { cache.cleanup(); }, 5 * 60 * 1000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend',
    version: '1.3.0',
    cache: cache.getStats()
  });
});

app.get('/api/jobs', async (req, res) => {
  // Validate input
  const { error, value } = jobsQuerySchema.validate(req.query);
  if (error) {
    logger.warn('Invalid query parameters', { errors: error.details });
    return res.status(400).json({
      error: 'Invalid parameters',
      details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
    });
  }

  const { search, location, page, limit } = value;
  const cacheKey = `${search}-${location}-${page}-${limit}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    logger.info('Serving from cache', { cacheKey });
    return res.json(cachedData);
  }

  try {
    logger.info('Fetching jobs from Adzuna', { search, location, page, limit });
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/us/search/${page}`,
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_API_KEY,
          what: search,
          where: location,
          results_per_page: limit,
        },
        timeout: 7000,
      }
    );

    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'Not specified',
      description: job.description,
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
        : null,
      posted_date: Math.floor(new Date(job.created).getTime() / 1000),
      tags: [job.contract_time || 'N/A', job.category?.label || 'General']
    }));

    const responseData = {
      jobs,
      total: response.data.count,
      page: parseInt(page),
      totalPages: Math.ceil(response.data.count / parseInt(limit))
    };

    cache.set(cacheKey, responseData);
    logger.info('Jobs fetched successfully', { count: jobs.length });
    res.json(responseData);
  } catch (error) {
    logger.error('Adzuna API error', { error: error.message });
    res.status(error.response?.status || 500).json({
      error: 'Job Search Error',
      message: process.env.NODE_ENV === 'production' ? 'Failed to fetch jobs' : error.message
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ error: 'Authentication not available', message: 'Deployed version does not include auth features' });
});
app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ error: 'Authentication not available', message: 'Deployed version does not include auth features' });
});
app.get('/api/auth/profile', (req, res) => {
  res.status(501).json({ error: 'Authentication not available', message: 'Deployed version does not include auth features' });
});
app.post('/api/bookmarks', (req, res) => {
  res.status(501).json({ error: 'Bookmarks not available', message: 'Deployed version does not include bookmark features' });
});
app.get('/api/bookmarks', (req, res) => {
  res.status(501).json({ error: 'Bookmarks not available', message: 'Deployed version does not include bookmark features' });
});
app.delete('/api/bookmarks/:jobId', (req, res) => {
  res.status(501).json({ error: 'Bookmarks not available', message: 'Deployed version does not include bookmark features' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`NextJob backend running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => { logger.info('Process terminated'); process.exit(0); });
});
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => { logger.info('Process terminated'); process.exit(0); });
});

module.exports = { app, cache, logger };
