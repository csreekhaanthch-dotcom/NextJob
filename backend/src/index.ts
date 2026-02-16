import app from './api/server';
import { scraperWorker } from './workers/scraperWorker';
import { analyticsWorker } from './workers/analyticsWorker';
import { monitoringWorker } from './workers/monitoringWorker';
import { dbManager } from './database/connection';
import { supabaseManager } from './database/supabaseConnection';
import { logger } from './monitoring/logger';
import fs from 'fs';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const provided = requiredEnvVars.filter(varName => process.env[varName]);
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (provided.length === 0) {
    console.warn('⚠️  Supabase credentials not provided. Falling back to SQLite storage.');
    return;
  }

  if (missing.length > 0) {
    console.warn('⚠️  Supabase credentials incomplete:');
    missing.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('⚠️  Falling back to SQLite storage.');
    return;
  }

  console.log('✅ Supabase environment variables validated');
}

async function initializeSystem() {
  try {
    logger.info('Initializing JobDone backend system', { environment: NODE_ENV });

    // Validate environment variables
    validateEnvironment();

    // Check if we're using Supabase or SQLite
    const isUsingSupabase = dbManager.isUsingSupabase();
    
    if (isUsingSupabase) {
      // Test Supabase connection
      const connectionOk = await supabaseManager.testConnection();
      if (connectionOk) {
        logger.info('✅ Connected to Supabase');
      } else {
        logger.error('❌ Failed to connect to Supabase');
        throw new Error('Supabase connection failed');
      }
    } else {
      // Ensure data directory exists for SQLite
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Initialize SQLite database
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

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      shutdown().then(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
    });

  } catch (error) {
    logger.error('Failed to initialize system', { error });
    process.exit(1);
  }
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
initializeSystem();

export { app };
