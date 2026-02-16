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
    rapidapi_configured: !!process.env.RAPIDAPI_KEY
  });
});

// Jobs search endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    const { keyword, location, page = '1', limit = '20' } = req.query;
    
    // Use defaults if no parameters provided
    const searchQuery = keyword || 'software engineer';
    const searchLocation = location || 'remote';
    
    console.log('Searching for:', searchQuery, 'in', searchLocation);
    
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
        location: searchLocation,
        page: page,
        num_pages: '1'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
      }
    };

    console.log('Making API request to JSearch...');
    
    const response = await axios.request(options);
    
    // Normalize response to match our Job interface
    const jobs = response.data.data?.map(job => ({
      id: job.job_id || Math.random().toString(36).substr(2, 9),
      title: job.job_title || 'Untitled Position',
      title_normalized: (job.job_title || '').toLowerCase(),
      company: job.employer_name || 'Unknown Company',
      company_domain: job.employer_website ? 
        job.employer_website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : 
        'unknown.com',
      location: job.job_location || `${job.job_city || ''}, ${job.job_state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Remote',
      location_normalized: (job.job_location || `${job.job_city || ''}, ${job.job_state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'remote').toLowerCase(),
      remote: job.job_is_remote || false,
      posted_date: job.job_posted_at_datetime_utc ? 
        Math.floor(new Date(job.job_posted_at_datetime_utc).getTime() / 1000) : 
        Math.floor(Date.now() / 1000),
      source: 'jsearch',
      job_url: job.job_apply_link || job.job_google_link || '#',
      description: job.job_description || 'No description available',
      salary: job.job_salary || job.job_salary_currency || 'Not specified',
      tags: job.job_required_skills || [],
      ranking_score: job.job_apply_quality_score || 0
    })) || [];

    res.json({
      jobs,
      total: response.data.total || jobs.length,
      page: parseInt(page),
      totalPages: Math.ceil((response.data.total || jobs.length) / parseInt(limit))
    });
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
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
    
    // JSearch doesn't have a direct job by ID endpoint, so we search with the ID
    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: `"${id}"`, // Search for the exact ID
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

    res.json({
      id: job.job_id,
      title: job.job_title,
      title_normalized: job.job_title?.toLowerCase() || '',
      company: job.employer_name,
      company_domain: job.employer_website?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || '',
      location: job.job_location || `${job.job_city || ''}, ${job.job_state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Remote',
      location_normalized: (job.job_location || `${job.job_city || ''}, ${job.job_state || ''}`).toLowerCase().replace(/^,\s*|,\s*$/g, '') || 'remote',
      remote: job.job_is_remote || false,
      posted_date: job.job_posted_at_datetime_utc ? Math.floor(new Date(job.job_posted_at_datetime_utc).getTime() / 1000) : Math.floor(Date.now() / 1000),
      source: 'jsearch',
      job_url: job.job_apply_link || job.job_google_link,
      description: job.job_description,
      salary: job.job_salary || job.job_salary_currency,
      tags: job.job_required_skills || [],
      ranking_score: job.job_apply_quality_score
    });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch job',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Job search server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Jobs endpoint: http://localhost:${PORT}/api/jobs`);
  
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('⚠️  RAPIDAPI_KEY not set in environment variables!');
    console.warn('   Please add your RapidAPI key to server/.env file');
  }
});

export default app;