import { adzunaClient } from './adzunaClient';
import { logger } from '../utils/logger';
import NodeCache from 'node-cache';

// Cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

interface CircuitBreaker {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const circuitBreaker: CircuitBreaker = {
  state: 'CLOSED',
  failureCount: 0,
  lastFailureTime: 0,
  nextAttemptTime: 0
};

const FAILURE_THRESHOLD = 5;
const TIMEOUT = 60000; // 1 minute

class JobAggregatorService {
  async searchJobs(params: {
    search?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: any[]; total: number; page: number; totalPages: number }> {
    const cacheKey = `jobs:${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logger.info('Cache hit for job search', { cacheKey });
      return cached;
    }
    
    // Check circuit breaker state
    if (circuitBreaker.state === 'OPEN') {
      if (Date.now() < circuitBreaker.nextAttemptTime) {
        logger.warn('Circuit breaker OPEN, using fallback response');
        return this.getFallbackResults();
      } else {
        circuitBreaker.state = 'HALF_OPEN';
        logger.info('Circuit breaker HALF_OPEN, trying request');
      }
    }
    
    try {
      const result = await adzunaClient.searchJobs(params);
      
      // Reset circuit breaker on success
      if (circuitBreaker.state !== 'CLOSED') {
        circuitBreaker.state = 'CLOSED';
        circuitBreaker.failureCount = 0;
        logger.info('Circuit breaker CLOSED after successful request');
      }
      
      // Cache results
      cache.set(cacheKey, result);
      logger.info('Cached job search results', { cacheKey });
      
      return result;
    } catch (error) {
      // Track failures for circuit breaker
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailureTime = Date.now();
      
      if (circuitBreaker.failureCount >= FAILURE_THRESHOLD) {
        circuitBreaker.state = 'OPEN';
        circuitBreaker.nextAttemptTime = Date.now() + TIMEOUT;
        logger.error('Circuit breaker OPEN due to failures', { 
          failureCount: circuitBreaker.failureCount 
        });
      }
      
      logger.error('Job search failed, using fallback', { error });
      return this.getFallbackResults();
    }
  }
  
  private getFallbackResults(): { jobs: any[]; total: number; page: number; totalPages: number } {
    return {
      jobs: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  }
  
  async getJobDetails(id: string): Promise<any> {
    // Implementation for getting detailed job information
    // Would include similar circuit breaker and caching logic
    return {};
  }
}

export const jobAggregatorService = new JobAggregatorService();