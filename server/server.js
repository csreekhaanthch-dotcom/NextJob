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
    service: 'nextjob-backend'
  });
});

// Jobs search endpoint
app.get('/api/jobs', (req, res) => {
  res.json({ 
    jobs: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'NextJob API Server is running', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});