const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const jobScraper = require('./scraper');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const Joi = require('joi');

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

const app = express();
const PORT = process.env.PORT || 3001;

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
  workSetting: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
}).unknown(true);

app.use(helmet());
app.use(cors());
app.use(express.json());

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

async function fetchJobs(search, location, page, limit) {
  if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
    try {
      const params = new URLSearchParams({
        app_id: ADZUNA_APP_ID,
        api_key: ADZUNA_API_KEY,
        results_per_page: limit,
        what: search || '',
        where: location || 'United States',
        page: page,
        'content-type': 'application/json'
      });
      logger.info(`Fetching from Adzuna with app_id: ${ADZUNA_APP_ID}`);
      const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search?${params}`);
      return response.data;
    } catch (err) {
      logger.error(`Adzuna error: ${err.message}`);
    }
  } else {
    logger.warn('Adzuna credentials not found, using fallback data');
  }
  return null;
}

app.get('/api/jobs', async (req, res) => {
  try {
    const { what, where, page = 1, sources } = req.query;

    // Parse sources (default: all available)
    let sourceList = sources
      ? sources.split(',').map(s => s.trim()).filter(Boolean)
      : ['adzuna', 'remotive', 'arbeitnow'];

    // Fetch from all sources
    const allJobs = await jobScraper.fetchAllJobs({
      query: what || '',
      location: where || '',
      page: parseInt(page),
      sources: sourceList,
    });

    // Paginate
    const limit = 20;
    const startIndex = (parseInt(page) - 1) * limit;
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);

    // Source stats
    const sourceStats = {};
    allJobs.forEach(job => {
      sourceStats[job.source] = (sourceStats[job.source] || 0) + 1;
    });

    res.json({
      results: paginatedJobs,
      count: paginatedJobs.length,
      total: allJobs.length,
      page: parseInt(page),
      sources: sourceStats,
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
