import app from './api/server';
import { scraperWorker } from './workers/scraperWorker';
import { analyticsWorker } from './workers/analyticsWorker';
import { monitoringWorker } from './workers/monitoringWorker';
import { dbManager } from './database/connection';
import { logger } from './monitoring/logger';
import fs from 'fs';
import path from 'path';

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these in Render Dashboard → Environment');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

async function initializeSystem() {
  logger.info('Initializing JobDone backend system');

  // Validate environment variables
  validateEnvironment();

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

  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    dbManager.getDB().exec(schema);
    logger.info('Database initialized');
  } else {
    logger.warn('Schema file not found, skipping database initialization');
  }

  // Start workers
  await scraperWorker.start();
  await analyticsWorker.start();
  await monitoringWorker.start();

  logger.info('Workers started');

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await shutdown();
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await shutdown();
  });
}

async function shutdown() {
  try {
    await scraperWorker.stop();
    await analyticsWorker.stop();
    await monitoringWorker.stop();
    dbManager.close();
    logger.info('Shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

// Start the system
initializeSystem().catch(error => {
  logger.error('Failed to initialize system', { error });
  process.exit(1);
});

export { app };
