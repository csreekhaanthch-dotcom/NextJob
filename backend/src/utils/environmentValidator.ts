import { logger } from './logger';

interface RequiredEnvVars {
  ADZUNA_APP_ID: string;
  ADZUNA_APP_KEY: string;
  PORT?: string;
  NODE_ENV?: string;
  FRONTEND_URL?: string;
}

export class EnvironmentValidator {
  static validate(): RequiredEnvVars {
    const requiredVars: (keyof RequiredEnvVars)[] = ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'];
    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      logger.error('Missing required environment variables', { missingVars });
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    logger.info('Environment variables validated successfully');
    
    return {
      ADZUNA_APP_ID: process.env.ADZUNA_APP_ID!,
      ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY!,
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL
    };
  }

  static validateAtStartup(): void {
    try {
      this.validate();
      logger.info('Environment validation passed');
    } catch (error) {
      logger.error('Environment validation failed', { error });
      process.exit(1);
    }
  }
}