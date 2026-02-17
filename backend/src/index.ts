import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('Starting NextJob backend server...');

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend'
  });
});

// Jobs search endpoint - placeholder for now
app.get('/api/jobs', (req: Request, res: Response) => {
  console.log('Jobs endpoint hit');
  res.json({ 
    jobs: [],
    total: 0,
    page: 1,
    totalPages: 0
  });
});

// Main endpoint
app.get('/', (req: Request, res: Response) => {
  console.log('Root endpoint hit');
  res.json({ 
    message: 'NextJob API Server is running', 
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Also listen for errors
server.on('error', (error) => {
  console.error('Server failed to start:', error);
});