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

// Main endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'JobBoard API Server is running', 
    port: PORT,
    endpoints: [
      'GET /health - Health check',
      'GET /api/jobs - Search jobs (requires RAPIDAPI_KEY)'
    ]
  });
});

// Jobs search endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    // Check if RapidAPI key is configured
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: 'RAPIDAPI_KEY not configured',
        message: 'Please add your RapidAPI key to server/.env file'
      });
    }

    res.json({ 
      message: 'API ready - Add your RAPIDAPI_KEY to server/.env',
      query: req.query
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});