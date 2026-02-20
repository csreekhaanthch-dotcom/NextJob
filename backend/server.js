require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const jobScraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
}).unknown(true);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/jobs', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.details });
    }

    const { search, location, page = 1, limit = 20 } = value;

    const allJobs = await jobScraper.fetchAllJobs({
      query: search || '',
      location: location || '',
      page: parseInt(page),
      sources: ['adzuna', 'remotive', 'arbeitnow'],
    });

    // Convert posted_at string to posted_date timestamp
    const jobs = allJobs.map(job => ({
      ...job,
      posted_date: job.posted_at ? new Date(job.posted_at).getTime() / 1000 : Date.now() / 1000,
    }));

    // Calculate pagination
    const total = jobs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (parseInt(page) - 1) * limit;
    const paginatedJobs = jobs.slice(startIndex, startIndex + limit);

    // Return format expected by frontend
    res.json({
      jobs: paginatedJobs,
      total: total,
      page: parseInt(page),
      totalPages: totalPages,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/', (req, res) => {
  res.json({ name: 'NextJob API', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
