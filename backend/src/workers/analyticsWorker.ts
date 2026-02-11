import { analyticsService } from '../services/analyticsService';

class AnalyticsWorker {
  private running: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  async start() {
    this.running = true;
    console.log('Starting analytics worker...');
    
    // Run immediately
    await this.generateAnalytics();
    
    // Schedule daily analytics generation
    this.intervalId = setInterval(async () => {
      if (this.running) {
        await this.generateAnalytics();
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  async stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('Analytics worker stopped');
  }

  private async generateAnalytics() {
    console.log('Generating daily analytics...');
    const startTime = Date.now();
    
    try {
      await analyticsService.generateDailyStats();
      console.log('Daily stats generated successfully');
      
      const duration = Date.now() - startTime;
      console.log(`Analytics generation completed in ${duration}ms`);
    } catch (error) {
      console.error('Error generating analytics:', error);
    }
  }
}

export const analyticsWorker = new AnalyticsWorker();