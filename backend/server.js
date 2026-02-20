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
    const { error, value } = jobsQuerySchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const { search, location, page, limit, sortBy } = value;
    
    let jobs = [];
    let total = 0;
    
    const data = await fetchJobs(search, location, page, limit);
    if (data && data.results) {
      jobs = data.results.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Unknown',
        location: job.location?.display_name || 'Remote',
        description: job.description || '',
        url: job.redirect_url,
        salary: job.salary_min && job.salary_max ? `$${Math.round(job.salary_min/1000)}K-$${Math.round(job.salary_max/1000)}K` : null,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        posted_date: job.created ? Math.floor(new Date(job.created).getTime() / 1000) : Date.now(),
        tags: job.category ? [job.category.label] : [],
        jobType: job.contract_time || 'full-time',
        workSetting: 'on-site'
      }));
      total = data.count || jobs.length;
    } else {
      total = 50;
      const now = Date.now();
      const titles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer'];
      const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Stripe', 'Airbnb'];
      const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA'];
      for (let i = 0; i < limit; i++) {
        jobs.push({
          id: `sample-${page}-${i}`,
          title: titles[i % titles.length],
          company: companies[i % companies.length],
          location: locations[i % locations.length],
          description: `Exciting opportunity for a ${titles[i % titles.length]} to join our team.`,
          url: 'https://example.com/apply',
          salary: `$${100 + i * 10}K-$${130 + i * 10}K`,
          salaryMin: (100 + i * 10) * 1000,
          salaryMax: (130 + i * 10) * 1000,
          posted_date: Math.floor((now - i * 86400000) / 1000),
          tags: ['Tech', 'Full-time'],
          jobType: 'full-time',
          workSetting: i % 3 === 0 ? 'remote' : (i % 3 === 1 ? 'hybrid' : 'on-site')
        });
      }
    }

    if (sortBy === 'recent') jobs.sort((a, b) => b.posted_date - a.posted_date);
    else if (sortBy === 'salary_high') jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    else if (sortBy === 'salary_low') jobs.sort((a, b) => (a.salaryMin || Infinity) - (b.salaryMin || Infinity));

    res.json({ jobs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
