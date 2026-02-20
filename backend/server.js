const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const Joi = require('joi');

dotenv.config();

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

// Updated validation schema to support sortBy
const jobsQuerySchema = Joi.object({
  search: Joi.string().max(200).trim().allow('').default(''),
  location: Joi.string().max(200).trim().allow('').default(''),
  page: Joi.number().integer().min(1).max(1000).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  sortBy: Joi.string().valid('recent', 'relevant', 'salary_high', 'salary_low').default('recent'),
  skills: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  jobType: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  experienceLevel: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  datePosted: Joi.string().valid('24h', '3d', '7d', '14d', '30d', 'all'),
  salaryRange: Joi.string(),
  workSetting: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
  industry: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
}).unknown(true);

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
  getStats() {
    return { size: this.cache.size, ...this.stats };
  }
}

const cache = new BoundedCache(MAX_CACHE_SIZE, CACHE_TTL);

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search';

async function fetchJobsFromAdzuna(search, location, page, limit) {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: limit,
    what: search || '',
    where: location || 'United States',
    page: page,
    'content-type': 'application/json'
  });
  const url = `${ADZUNA_BASE_URL}?${params}`;
  logger.info(`Fetching from Adzuna: ${url}`);
  const response = await axios.get(url);
  return response.data;
}

app.get('/api/jobs', async (req, res) => {
  try {
    const { error, value } = jobsQuerySchema.validate(req.query);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }
    const { search, location, page, limit, sortBy } = value;
    const cacheKey = `${search}-${location}-${page}-${limit}`;
    
    let data = cache.get(cacheKey);
    if (!data) {
      data = await fetchJobsFromAdzuna(search, location, page, limit);
      cache.set(cacheKey, data);
    }

    let jobs = (data.results || []).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || job.company || 'Unknown',
      location: job.location?.display_name || 'Remote',
      description: job.description || '',
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max ? `$${Math.round(job.salary_min/1000)}K - $${Math.round(job.salary_max/1000)}K` : null,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      posted_date: job.created ? Math.floor(new Date(job.created).getTime() / 1000) : Date.now(),
      tags: job.category ? [job.category.label] : [],
      jobType: job.contract_time || 'full-time',
      workSetting: 'on-site'
    }));

    if (sortBy === 'recent') jobs.sort((a, b) => b.posted_date - a.posted_date);
    else if (sortBy === 'salary_high') jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    else if (sortBy === 'salary_low') jobs.sort((a, b) => (a.salaryMin || Infinity) - (b.salaryMin || Infinity));

    res.json({ jobs, total: data.count || jobs.length, page, totalPages: Math.ceil((data.count || jobs.length) / limit) });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), cache: cache.getStats() });
});

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
