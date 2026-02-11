import os from 'os';

interface ScalingMetrics {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  requestRate: number;
}

class AutoScaler {
  private metricsHistory: ScalingMetrics[] = [];
  private lastScaleAction: number = 0;
  private scaleCooldown: number = 5 * 60 * 1000; // 5 minutes cooldown

  /**
   * Collect current system metrics
   */
  collectMetrics(apiLatency: number, requestRate: number): void {
    const cpuUsage = this.getCpuUsage();
    const memoryUsage = this.getMemoryUsage();
    
    this.metricsHistory.push({
      cpuUsage,
      memoryUsage,
      apiLatency,
      requestRate
    });
    
    // Keep only last 100 measurements
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Determine if scaling action is needed
   */
  shouldScale(): 'up' | 'down' | 'none' {
    const now = Date.now();
    
    // Check cooldown period
    if (now - this.lastScaleAction < this.scaleCooldown) {
      return 'none';
    }
    
    // Need at least 5 minutes of data
    if (this.metricsHistory.length < 5) {
      return 'none';
    }
    
    // Calculate averages over last 5 measurements
    const recentMetrics = this.metricsHistory.slice(-5);
    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length;
    const avgLatency = recentMetrics.reduce((sum, m) => sum + m.apiLatency, 0) / recentMetrics.length;
    
    // Scale up conditions
    if (avgCpu > 60 || avgLatency > 100) {
      return 'up';
    }
    
    // Scale down conditions
    if (avgCpu < 30 && avgLatency < 100) {
      return 'down';
    }
    
    return 'none';
  }

  /**
   * Execute scaling action (placeholder - would integrate with Fly.io API)
   */
  async executeScaling(action: 'up' | 'down'): Promise<void> {
    const now = Date.now();
    
    // Respect cooldown period
    if (now - this.lastScaleAction < this.scaleCooldown) {
      console.log('_scaling action skipped due to cooldown period_');
      return;
    }
    
    this.lastScaleAction = now;
    
    switch (action) {
      case 'up':
        console.log('⬆️  Scaling UP: Increasing instances');
        // In production, call Fly.io API to scale up:
        // await fly.machines.increaseCount(appName, 1);
        break;
        
      case 'down':
        console.log('⬇️  Scaling DOWN: Decreasing instances');
        // In production, call Fly.io API to scale down (but maintain minimum):
        // await fly.machines.decreaseCount(appName, 1, { minMachines: 1 });
        break;
    }
  }

  /**
   * Get current CPU usage percentage
   */
  private getCpuUsage(): number {
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
  private getMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return parseFloat(((usedMem / totalMem) * 100).toFixed(2));
  }
}

export const autoScaler = new AutoScaler();