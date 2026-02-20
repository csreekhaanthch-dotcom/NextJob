require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const jobScraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Validation schema
const searchSchema = Joi.object({
  what: Joi.string().allow('', null).max(200),
  where: Joi.string().allow('', null).max(200),
  page: Joi.number().min(1).max(100).default(1),
  sort_by: Joi.string().allow(''),
  sort_dir: Joi.string().allow(''),
  days: Joi.number().allow(null),
  category: Joi.string().allow(''),
  sources: Joi.string().allow(''),
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Jobs endpoint - returns format expected by frontend
app.get('/api/jobs', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.details });
    }

    const { what, where, page = 1, sources } = value;

    // Fetch from all sources
    const sourceList = sources
      ? sources.split(',').map(s => s.trim()).filter(Boolean)
      : ['adzuna', 'remotive', 'arbeitnow'];

    const allJobs = await jobScraper.fetchAllJobs({
      query: what || '',
      location: where || '',
      page: parseInt(page),
      sources: sourceList,
    });

    // Return in format frontend expects
    res.json({
      results: allJobs,
      count: allJobs.length,
      mean: 0,
      locations: [],
      ads: 0,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// API info
app.get('/', (req, res) => {
  res.json({ 
    name: 'NextJob API', 
    version: '2.0.0',
    endpoints: { '/api/jobs': 'Search jobs', '/health': 'Health check' }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Sources: Adzuna, Remotive, Arbeitnow');
});

module.exports = app;
