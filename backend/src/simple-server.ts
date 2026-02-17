import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('Starting simplified NextJob backend server...');
console.log('Port:', PORT);

// Simple health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nextjob-backend-simple'
  });
});

// Simple root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({ 
    message: 'Simple NextJob API Server is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://0.0.0.0:${PORT}`);
}).on('error', (error) => {
  console.error('Server failed to start:', error);
});