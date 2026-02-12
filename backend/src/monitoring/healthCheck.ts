import express from 'express';
import { dbManager } from '../database/connection';
import { logger } from './logger';
import os from 'os';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint for monitoring
 */
router.get('/', (req, res) => {
  try {
    // Check database connectivity
    const db = dbManager.getDB();
    const dbCheck = db.prepare('SELECT 1 as ok').get();
    
    // Check system resources
    const cpuUsage = getCpuUsage();
    const memoryUsage = getMemoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: formatUptime(uptime),
      system: {
        cpu_usage: cpuUsage,
        memory_usage: memoryUsage,
        total_memory: os.totalmem(),
        free_memory: os.freemem()
      },
      database: {
        connected: !!dbCheck
      },
      version: process.env.npm_package_version || 'unknown'
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
   * GET /health/metrics
   * Detailed metrics endpoint
   */
router.get('/metrics', (req, res) => {
  try {
    // In a real implementation, this would return detailed metrics
    // from the metrics collector
    
    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      metrics: {
        // Placeholder metrics - would be populated by metricsCollector
        api_response_time: {
          avg: 42,
          p95: 98,
          p99: 156
        },
        db_query_latency: {
          avg: 12,
          p95: 28,
          p99: 45
        },
        cache_hit_rate: 85.5,
        active_connections: 15
      }
    });
  } catch (error) {
    logger.error('Metrics endpoint failed', { error });
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * Get current CPU usage percentage
 */
function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type];
    }
    totalIdle += cpu.times.idle;
  }
  
  return parseFloat(((1 - totalIdle / totalTick) * 100).toFixed(2));
}

/**
 * Get current memory usage percentage
 */
function getMemoryUsage(): number {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return parseFloat(((usedMem / totalMem) * 100).toFixed(2));
}

/**
 * Format uptime string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}

export default router;