const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle SPA routing
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

// Mock jobs endpoint for demonstration
app.get('/api/jobs', (req, res) => {
  const { search = '', location = '', page = 1, limit = 12 } = req.query;
  
  // Generate mock jobs data
  const mockJobs = Array.from({ length: 20 }, (_, i) => ({
    id: `job-${i + 1}`,
    title: `${['Software', 'Frontend', 'Backend', 'DevOps', 'Data'][i % 5]} Engineer`,
    company: `Company ${(i % 8) + 1}`,
    location: location || ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Seattle, WA'][i % 5],
    description: `We are looking for a skilled ${['Software', 'Frontend', 'Backend', 'DevOps', 'Data'][i % 5]} engineer to join our team. You will work on exciting projects and help shape the future of our company.`,
    url: `https://example.com/jobs/job-${i + 1}`,
    salary: `$${(80 + i * 10).toLocaleString()}`, // Simplified salary
    posted_date: Math.floor(Date.now() / 1000) - (i * 86400), // Days ago
    tags: [['Full-time'], ['Remote'], ['Tech'], ['Engineering']][i % 4]
  }));
  
  // Filter by search term if provided
  const filteredJobs = search 
    ? mockJobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase())
      )
    : mockJobs;
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    jobs: paginatedJobs,
    total: filteredJobs.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredJobs.length / parseInt(limit))
  });
});

// Single job endpoint
app.get('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  
  // Create a mock job based on the ID
  const job = {
    id: jobId,
    title: `Software Engineer - ${jobId}`,
    company: 'Tech Company Inc.',
    location: 'San Francisco, CA',
    description: 'We are seeking a talented Software Engineer to join our dynamic team. You will be responsible for developing and maintaining high-quality software solutions.',
    url: `https://example.com/jobs/${jobId}`,
    salary: '$120,000 - $150,000',
    posted_date: Math.floor(Date.now() / 1000) - 86400, // Yesterday
    tags: ['Full-time', 'Remote', 'Tech', 'Engineering']
  };
  
  res.json(job);
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
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});