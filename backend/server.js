const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  const { search = '', location = '', page = 1, limit = 12 } = req.query;
  const cacheKey = `${search}-${location}-${page}-${limit}`;
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log("Serving from cache");
    return res.json(cachedData);
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
    res.json(responseData);
  } catch (error) {
    console.error("Adzuna API error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Adzuna API Error",
      message: error.response?.data || error.message
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
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend running on port ${PORT}`);
  console.log(`Health check: /health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => console.log('Process terminated'));
});
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => console.log('Process terminated'));
});
