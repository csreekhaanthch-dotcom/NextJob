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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});