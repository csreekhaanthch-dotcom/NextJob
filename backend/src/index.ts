import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend'
  });
});

// Jobs search endpoint - placeholder for now
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json({ 
    jobs: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
});

// Main endpoint
app.get('/', (req: Request, res: Response) => {
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

// Also listen on localhost for local development
app.listen(PORT, 'localhost', () => {
  console.log(`Server also accessible at http://localhost:${PORT}`);
});