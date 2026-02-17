import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('Starting backend server with configuration:');
console.log('- PORT:', PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- RAPIDAPI_KEY configured:', !!process.env.RAPIDAPI_KEY);

// Enable CORS for all origins in development, specific origins in production
if (process.env.NODE_ENV === 'production') {
  // In production, only allow requests from the frontend domain
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://your-frontend.onrender.com',
    credentials: true
  };
  console.log('Production CORS enabled for origin:', corsOptions.origin);
  app.use(cors(corsOptions));
} else {
  // In development, allow all origins
  console.log('Development CORS enabled (all origins allowed)');
  app.use(cors());
}

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested from IP:', req.ip);
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint requested from IP:', req.ip);
  res.json({ 
    message: 'NextJob API Server is running',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// JSearch API integration for jobs
app.get('/api/jobs', async (req, res) => {
  try {
    console.log('Fetching jobs from JSearch API with params:', req.query);
    
    // Check if API key is configured
    if (!process.env.RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not configured');
      return res.status(500).json({ 
        error: 'API key not configured', 
        message: 'RAPIDAPI_KEY environment variable is missing' 
      });
    }

    // Prepare query parameters
    const queryParams = new URLSearchParams();
    
    // Add search parameters if provided
    if (req.query.keyword) queryParams.append('query', req.query.keyword as string);
    if (req.query.location) queryParams.append('location', req.query.location as string);
    if (req.query.page) queryParams.append('page', req.query.page as string);
    if (req.query.limit) queryParams.append('num_pages', req.query.limit as string);
    
    // Add remote filter if specified
    if (req.query.remote === 'true') {
      queryParams.append('remote_jobs_only', 'true');
    }
    
    // Set defaults if no parameters provided
    if (!req.query.keyword) queryParams.append('query', 'software engineer');
    
    const apiUrl = `https://jsearch.p.rapidapi.com/search?${queryParams.toString()}`;
    console.log('Making request to JSearch API:', apiUrl);

    // Make request to JSearch API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    console.log('JSearch API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('JSearch API error response:', errorText);
      return res.status(response.status).json({ 
        error: 'JSearch API error', 
        status: response.status,
        message: errorText 
      });
    }

    const data = await response.json();
    console.log('JSearch API response received, jobs count:', data.data?.length || 0);

    // Transform JSearch response to our expected format
    const jobs = data.data?.map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ''}${job.job_state ? `, ${job.job_state}` : ''}${job.job_country ? `, ${job.job_country}` : ''}`.trim() || 'Remote',
      remote: job.job_is_remote || false,
      posted_date: Math.floor(new Date(job.job_posted_at_datetime_utc).getTime() / 1000),
      job_url: job.job_apply_link || job.job_google_link || '#',
      description: job.job_description || job.job_highlights?.Qualifications?.join(' ') || '',
      salary: job.job_salary_currency ? `${job.job_salary_currency} ${job.job_salary} ${job.job_salary_period || ''}` : '',
      tags: [job.job_employment_type, ...(job.job_required_skills || [])].filter(Boolean),
      company_domain: job.employer_website ? new URL(job.employer_website).hostname : null
    })) || [];

    res.json({
      jobs: jobs,
      total: data.results_total || jobs.length,
      page: parseInt(req.query.page as string) || 1,
      totalPages: Math.ceil((data.results_total || jobs.length) / (parseInt(req.query.limit as string) || 10))
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found for URL:', req.url);
  res.status(404).json({ error: 'Not found' });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend server listening at http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
});

// Handle server startup errors
server.on('error', (error: any) => {
  console.error('Server failed to start:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using that port.`);
  }
});