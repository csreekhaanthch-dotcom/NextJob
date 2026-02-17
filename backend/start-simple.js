const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested at', new Date().toISOString());
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'NextJob API Server is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Jobs endpoint mock
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [
      {
        "id": "1",
        "employer_name": "Google",
        "employer_logo": "https://logo.clearbit.com/google.com",
        " employer_website": "https://google.com",
        "job_title": "Software Engineer",
        "job_description": "Develop amazing products",
        "job_country": "US",
        "job_city": "Mountain View",
        "job_state": "CA",
        "job_posted_at": "2023-01-01",
        "job_apply_link": "https://google.com/jobs/1"
      }
    ],
    total: 1,
    page: 1,
    totalPages: 1
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple NextJob backend server listening at http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`Press Ctrl+C to stop the server`);
}).on('error', (error) => {
  console.error('Failed to start server:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using that port.`);
  }
  process.exit(1);
});