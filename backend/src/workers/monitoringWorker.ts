import { metricsCollector } from '../monitoring/metricsCollector';
import { alertService } from '../monitoring/alertService';
import { autoScaler } from '../monitoring/autoScaler';
import { performanceOptimizer } from '../monitoring/performanceOptimizer';

class MonitoringWorker {
  private running: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  async start() {
    this.running = true;
    console.log('Starting monitoring worker...');
    
    // Run immediate checks
    await this.runMonitoringCycle();
    
    // Schedule periodic monitoring every minute
    this.intervalId = setInterval(async () => {
      if (this.running) {
        await this.runMonitoringCycle();
      }
    }, 60 * 1000); // Every minute
  }

  async stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('Monitoring worker stopped');
  }

  private async runMonitoringCycle() {
    console.log('Running monitoring cycle...');
    
    try {
      // Check metrics and send alerts
      await alertService.checkAndSendAlerts();
      
      // Run performance optimizations periodically
      const minute = new Date().getMinutes();
      if (minute === 0) { // Run every hour
        await performanceOptimizer.cacheTrendingJobs();
        await performanceOptimizer.optimizeDatabaseIndexes();
      }
      
      // Precompute user vectors during off-peak hours
      const hour = new Date().getHours();
      if (hour >= 2 && hour <= 4) { // Early morning hours
        await performanceOptimizer.precomputeUserVectors();
      }
      
      console.log('Monitoring cycle completed');
    } catch (error) {
      console.error('Error in monitoring cycle:', error);
    }
  }
}

export const monitoringWorker = new MonitoringWorker();