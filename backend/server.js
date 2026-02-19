const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cache service
let cacheService;
try {
  const RedisService = require('./src/services/RedisService');
  cacheService = new RedisService();
  console.log('Redis service initialized');
} catch (error) {
  console.warn('Failed to initialize Redis service, using simple in-memory cache:', error.message);
  // Simple in-memory cache fallback
  const NodeCache = require('node-cache');
  cacheService = {
    fallbackCache: new NodeCache({ stdTTL: 300 }),
    get: function(key) {
      return this.fallbackCache.get(key);
    },
    set: function(key, value, ttlSeconds = 300) {
      return this.fallbackCache.set(key, value, ttlSeconds);
    },
    getStatus: function() {
      return { redis: 'not available', fallback: 'in-memory cache' };
    }
  };
}

// ===============================
// Connect to MongoDB (only if URI is provided)
// ===============================
let mongoose;
let dbConnected = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping MongoDB connection - auth features will be limited');
      return;
    }
    
    mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('MongoDB not available - auth features will be disabled');
  }
};

connectDB();

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

// ===============================
// Auth Routes (only if DB is connected)
// ===============================
let User, auth;
if (dbConnected) {
  User = require('./src/models/User');
  auth = require('./src/middleware/auth');
  
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user
      const user = new User({ email, password, name });
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user profile
  app.get('/api/auth/profile', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('bookmarks');
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          bookmarks: user.bookmarks
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===============================
  // Bookmark Routes
  // ===============================
  const Job = require('./src/models/Job');

  // Bookmark a job
  app.post('/api/bookmarks', auth, async (req, res) => {
    try {
      const { job } = req.body;
      
      // Save job to database if not exists
      let savedJob = await Job.findOne({ jobId: job.id });
      if (!savedJob) {
        savedJob = new Job({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          url: job.url,
          salary: job.salary,
          posted_date: job.posted_date,
          tags: job.tags
        });
        await savedJob.save();
      }
      
      // Add to user bookmarks
      const user = await User.findById(req.user._id);
      if (!user.bookmarks.includes(savedJob._id)) {
        user.bookmarks.push(savedJob._id);
        await user.save();
      }
      
      res.json({ message: 'Job bookmarked successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get bookmarks
  app.get('/api/bookmarks', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('bookmarks');
      res.json({ bookmarks: user.bookmarks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove bookmark
  app.delete('/api/bookmarks/:jobId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.toString() !== req.params.jobId
      );
      await user.save();
      res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
} else {
  // Mock auth endpoints when DB is not available
  app.post('/api/auth/register', (req, res) => {
    res.status(501).json({ 
      error: 'Authentication not available', 
      message: 'MongoDB not configured - auth features disabled' 
    });
  });

  app.post('/api/auth/login', (req, res) => {
    res.status(501).json({ 
      error: 'Authentication not available', 
      message: 'MongoDB not configured - auth features disabled' 
    });
  });

  app.get('/api/auth/profile', (req, res) => {
    res.status(501).json({ 
      error: 'Authentication not available', 
      message: 'MongoDB not configured - auth features disabled' 
    });
  });

  app.post('/api/bookmarks', (req, res) => {
    res.status(501).json({ 
      error: 'Bookmarks not available', 
      message: 'MongoDB not configured - bookmark features disabled' 
    });
  });

  app.get('/api/bookmarks', (req, res) => {
    res.status(501).json({ 
      error: 'Bookmarks not available', 
      message: 'MongoDB not configured - bookmark features disabled' 
    });
  });

  app.delete('/api/bookmarks/:jobId', (req, res) => {
    res.status(501).json({ 
      error: 'Bookmarks not available', 
      message: 'MongoDB not configured - bookmark features disabled' 
    });
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
    version: '1.1.0',
    cache: cacheService.getStatus(),
    auth: dbConnected ? 'available' : 'not configured',
    databases: {
      mongodb: dbConnected ? 'connected' : 'not configured',
      redis: cacheService.getStatus().redis
    }
  });
});

// ===============================
// Jobs Endpoint (Adzuna API)
// ===============================

app.get('/api/jobs', async (req, res) => {
  const { search = '', location = '', page = 1, limit = 12 } = req.query;

  const cacheKey = `${search}-${location}-${page}-${limit}`;
  const cachedData = await cacheService.get(cacheKey);

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
    await cacheService.set(cacheKey, responseData);

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
// Single Job Endpoint
// ===============================

app.get('/api/jobs/:id', async (req, res) => {
  res.status(501).json({
    error: 'Single job fetch not implemented',
    message: 'Use /api/jobs with search parameters instead'
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
  if (!dbConnected) {
    console.log('NOTE: Authentication features are disabled because MongoDB is not configured');
    console.log('To enable auth features, set MONGODB_URI in your .env file');
  }
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