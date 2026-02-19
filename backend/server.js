// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Only allow your frontend domain
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend',
    version: '1.0.0'
  });
});

// Jobs endpoint - fetch from Adzuna API
app.get('/api/jobs', async (req, res) => {
  try {
    const { search = '', location = '', page = 1, limit = 12 } = req.query;

    const ADZUNA_API_URL = `https://api.adzuna.com/v1/api/jobs/us/search/${page}`;
    const params = {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      results_per_page: limit,
      what: search,
      where: location,
      content_type: 'application/json',
    };

    const response = await axios.get(ADZUNA_API_URL, {
      params,
      timeout: 7000, // 7-second timeout
    });

    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` 
        : 'Not specified',
      posted_date: new Date(job.created).getTime() / 1000,
      tags: ['Full-time', 'Remote', 'Tech', 'Engineering'], // optional
    }));

    res.json({
      jobs,
      total: response.data.count,
      page: parseInt(page),
      totalPages: Math.ceil(response.data.count / limit),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Request timeout', message: 'Backend took too long to respond' });
    } else if (error.response) {
      res.status(error.response.status).json({ error: 'API Error', message: error.response.data });
    } else {
      res.status(500).json({ error: 'Server Error', message: error.message });
    }
  }
});

// Single job endpoint
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Adzuna doesn't have single job fetch, so fallback to search by ID in results
    res.status(501).json({ error: 'Single job fetch not implemented, use /api/jobs with search query' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend server listening at http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => console.log('Process terminated'));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => console.log('Process terminated'));
});
