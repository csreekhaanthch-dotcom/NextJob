const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend'
  });
});

// Mock jobs endpoint
app.get('/api/jobs', (req, res) => {
  const { search = 'software', location, page = 1, limit = 12 } = req.query;
  
  // Generate mock jobs data
  const jobs = Array.from({ length: parseInt(limit) }, (_, i) => ({
    id: `${i + 1}`,
    title: `${search.charAt(0).toUpperCase() + search.slice(1)} Engineer ${i + 1}`,
    company: `Company ${(i % 5) + 1}`,
    location: location || ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX', 'Seattle, WA'][i % 5],
    description: `We are looking for a skilled ${search} engineer to join our team. You will work on exciting projects and help shape the future of our company.`,
    url: `https://example.com/jobs/${i + 1}`,
    salary: `$${(80000 + i * 10000).toLocaleString()}`,
    posted_date: Math.floor(Date.now() / 1000) - (i * 86400), // Days ago
    tags: ['Full-time', 'Tech', 'Engineering']
  }));
  
  res.json({
    jobs,
    total: 100,
    page: parseInt(page),
    totalPages: Math.ceil(100 / parseInt(limit))
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend server listening at http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
}).on('error', (error) => {
  console.error('Failed to start server:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using that port.`);
  }
  process.exit(1);
});