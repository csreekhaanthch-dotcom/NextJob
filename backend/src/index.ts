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
console.log('- ADZUNA_APP_ID configured:', !!process.env.ADZUNA_APP_ID);
console.log('- ADZUNA_APP_KEY configured:', !!process.env.ADZUNA_APP_KEY);

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

// Adzuna API integration for jobs
app.get('/api/jobs', async (req, res) => {
  try {
    console.log('Fetching jobs from Adzuna API with params:', req.query);
    
    // Check if API credentials are configured
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      console.error('Adzuna API credentials not configured');
      return res.status(500).json({ 
        error: 'API credentials not configured', 
        message: 'ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables are missing' 
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || 'software';
    const location = req.query.location as string || 'United States';
    
    // Construct Adzuna API URL
    // Adzuna uses 1-based indexing for pages
    const apiUrl = `https://api.adzuna.com/v1/api/jobs/us/search/${page-1}`;
    
    // Prepare query parameters for Adzuna API
    const queryParams = new URLSearchParams();
    queryParams.append('app_id', process.env.ADZUNA_APP_ID);
    queryParams.append('app_key', process.env.ADZUNA_APP_KEY);
    queryParams.append('results_per_page', limit.toString());
    
    // Add search term
    if (search) {
      queryParams.append('what', search);
    }
    
    // Add location filter
    if (location && location !== 'United States') {
      queryParams.append('where', location);
    } else {
      // Default to United States if no specific location
      queryParams.append('location0', 'United States');
    }
    
    // Add content type to get full job descriptions
    queryParams.append('content-type', 'application/json');
    
    const fullApiUrl = `${apiUrl}?${queryParams.toString()}`;
    console.log('Making request to Adzuna API:', fullApiUrl);

    // Make request to Adzuna API
    const response = await fetch(fullApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Adzuna API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Adzuna API error response:', errorText);
      return res.status(response.status).json({ 
        error: 'Adzuna API error', 
        status: response.status,
        message: errorText 
      });
    }

    const data = await response.json();
    console.log('Adzuna API response received, jobs count:', data.results?.length || 0);

    // Transform Adzuna response to our expected format
    const jobs = data.results?.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      description: job.description || '',
      url: job.redirect_url || '#',
      salary: job.salary_min && job.salary_max 
        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
        : 'Not specified',
      posted_date: Math.floor(new Date(job.created).getTime() / 1000),
      tags: job.category?.label ? [job.category.label] : []
    })) || [];

    res.json({
      jobs: jobs,
      total: data.count || jobs.length,
      page: page,
      totalPages: Math.ceil((data.count || jobs.length) / limit)
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