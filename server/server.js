import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    rapidapi_configured: !!process.env.RAPIDAPI_KEY,
    service: 'jobboard-backend'
  });
});

// Jobs search endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const { keyword, location, page = '1', limit = '20', remote } = req.query;
    
    // Build search query
    let searchQuery = 'software engineer';
    if (keyword) searchQuery = keyword;
    if (location) searchQuery += ` in ${location}`;
    if (remote === 'true') searchQuery += ' remote';
    
    // Check if RapidAPI key is configured
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'RAPIDAPI_KEY not configured',
        message: 'Please add your RapidAPI key to server/.env file'
      });
    }

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: searchQuery,
        page: page,
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    // Normalize response to match our Job interface
    const jobs = response.data.data?.map(job => ({
      id: job.job_id || Math.random().toString(36).substr(2, 9),
      title: job.job_title || 'Untitled Position',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}` 
        : job.job_country || 'Remote',
      remote: job.job_is_remote || false,
      posted_date: job.job_posted_at_timestamp || Math.floor(Date.now() / 1000),
      job_url: job.job_apply_link || job.job_google_link || '#',
      description: job.job_description?.substring(0, 300) + '...' || 'No description available',
      salary: job.job_salary || job.job_salary_currency || 'Not specified',
      tags: job.job_required_skills || [],
      logo: job.employer_logo || null
    })) || [];

    res.json({
      jobs,
      total: response.data.total || jobs.length,
      page: parseInt(page),
      totalPages: Math.ceil((response.data.total || jobs.length) / parseInt(limit))
    });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get single job endpoint
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if RapidAPI key is configured
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'RAPIDAPI_KEY not configured',
        message: 'Please add your RapidAPI key to server/.env file'
      });
    }
    
    // Search for the job by ID
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `"${id}"`,
        page: '1',
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    const job = response.data.data?.find(j => j.job_id === id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const normalizedJob = {
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}` 
        : job.job_country || 'Remote',
      remote: job.job_is_remote || false,
      posted_date: job.job_posted_at_timestamp || Math.floor(Date.now() / 1000),
      job_url: job.job_apply_link || job.job_google_link,
      description: job.job_description,
      salary: job.job_salary || job.job_salary_currency,
      tags: job.job_required_skills || [],
      logo: job.employer_logo || null
    };

    res.json(normalizedJob);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch job',
      message: error.message 
    });
  }
});

// Simple root endpoint to confirm server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'JobBoard API Server is running', 
    endpoints: [
      'GET /health - Health check',
      'GET /api/jobs - Search jobs',
      'GET /api/jobs/:id - Get job by ID'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Job search server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Jobs endpoint: http://localhost:${PORT}/api/jobs`);
  
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('⚠️  RAPIDAPI_KEY not set in environment variables!');
    console.warn('   Please add your RapidAPI key to server/.env file');
  }
});

export default app;