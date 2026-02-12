import app from './api/server';
import { scraperWorker } from './workers/scraperWorker';
import { analyticsWorker } from './workers/analyticsWorker';
import { monitoringWorker } from './workers/monitoringWorker';
import { dbManager } from './database/connection';
import fs from 'fs';
import path from 'path';

async function initializeSystem() {
  console.log('Initializing JobDone backend system...');
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Initialize database
  let schemaPath = path.join(__dirname, 'database', 'schema.sql');
  // Fallback for development when running from src
  if (!fs.existsSync(schemaPath)) {
    schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
  }
  const schema = fs.readFileSync(schemaPath, 'utf8');
  dbManager.getDB().exec(schema);
  
  console.log('Database initialized');
  
  // Start workers
  await scraperWorker.start();
  await analyticsWorker.start();
  await monitoringWorker.start();
  
  console.log('Workers started');
  
  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await shutdown();
  });
  
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await shutdown();
  });
}

async function shutdown() {
  try {
    await scraperWorker.stop();
    await analyticsWorker.stop();
    await monitoringWorker.stop();
    dbManager.close();
    console.log('Shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the system
initializeSystem().catch(error => {
  console.error('Failed to initialize system:', error);
  process.exit(1);
});

export { app };