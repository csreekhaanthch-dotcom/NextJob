// Minimal working backend for NextJob
import express from 'express';
import cors from 'crosorigin';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Enable CORS for all origins in development, specific origins in production
if (process.env.NODE_ENV === 'production') {
  // In production, only allow requests from the frontend domain
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-frontend.onrender.com',
    credentials: true
  }));
} else {
  // In development, allow all origins
  app.use(cors());
}

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple jobs endpoint for testing
app.get('/api/jobs', (req, res) => {
  res.json({
    jobs: [],
    total: 0,
    page: 1,
    totalPages: 1
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextJob backend server listening at http://0.0.0.0:${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});

// Handle server startup errors
server.on('error', (error: any) => {
  console.error('Server failed to start:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using that port.`);
  }
});