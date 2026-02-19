const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ===============================
// Middleware
// ===============================

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Serve frontend for all routes except API
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ===============================
// Health Check
// ===============================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend',
    version: '1.2.0',
    cache: 'in-memory'
  });
});

// ===============================
// Jobs Endpoint (Adzuna API)
// ===============================

app.get('/api/jobs', async (req, res) => {
  const { search = '', location = '', page = 1, limit = 12 } = req.query;

  const cacheKey = `${search}-${location}-${page}-${limit}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Serving from cache");
      return res.json(cached.data);
    } else {
      // Remove expired cache entry
      cache.delete(cacheKey);
    }
  }

  try {
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
        timeout: 7000, // 7 second timeout protection
      }
    );

    const jobs = response.data.results.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'Not specified',
      description: job.description,
      url: job.redirect_url,
      salary:
        job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
          : null,
      posted_date: Math.floor(new Date(job.created).getTime() / 1000),
      tags: [
        job.contract_time || 'N/A',
        job.category?.label || 'General'
      ]
    }));

    const responseData = {
      jobs,
      total: response.data.count,
      page: parseInt(page),
      totalPages: Math.ceil(response.data.count / parseInt(limit))
    };

    // Store in cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    res.json(responseData);

  } catch (error) {
    console.error("Adzuna API error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      error: "Adzuna API Error",
      message: error.response?.data || error.message
    });
  }
});

// ===============================
// Mock Auth Endpoints (for compatibility)
// ===============================

app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ 
    error: 'Authentication not available', 
    message: 'Deployed version does not include auth features' 
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ 
    error: 'Authentication not available', 
    message: 'Deployed version does not include auth features' 
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.status(501).json({ 
    error: 'Authentication not available', 
    message: 'Deployed version does not include auth features' 
  });
});

app.post('/api/bookmarks', (req, res) => {
  res.status(501).json({ 
    error: 'Bookmarks not available', 
    message: 'Deployed version does not include bookmark features' 
  });
});

app.get('/api/bookmarks', (req, res) => {
  res.status(501).json({ 
    error: 'Bookmarks not available', 
    message: 'Deployed version does not include bookmark features' 
  });
});

app.delete('/api/bookmarks/:jobId', (req, res) => {
  res.status(501).json({ 
    error: 'Bookmarks not available', 
    message: 'Deployed version does not include bookmark features' 
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error'
  });
});

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===============================
// Start Server
// ===============================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend running on port ${PORT}`);
  console.log(`Health check: /health`);
  console.log('NOTE: Authentication features are disabled in deployed version');
});

// ===============================
// Graceful Shutdown
// ===============================

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});