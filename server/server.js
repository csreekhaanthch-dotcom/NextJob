import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'jobboard-backend'
  });
});

// Jobs search endpoint placeholder
app.get('/api/jobs', async (req, res) => {
  try {
    // Return sample data for now
    res.json({ 
      jobs: [
        {
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          remote: true,
          posted_date: Math.floor(Date.now() / 1000),
          job_url: 'https://example.com/job/1',
          description: 'Join our team of talented engineers working on cutting-edge technology.'
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'JobBoard API Server is running', 
    port: PORT,
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Health check',
      'GET /api/jobs - Search jobs'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/health`);
});