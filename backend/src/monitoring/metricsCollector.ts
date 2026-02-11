import { LRUCache } from 'lru-cache';

interface Metric {
  timestamp: number;
  value: number;
}

class MetricsCollector {
  private metrics: Map<string, LRUCache<string, Metric>> = new Map();

  constructor() {
    // Initialize metrics cache with 1 hour TTL
    const metricCache = new LRUCache<string, Metric>({
      max: 10000,
      ttl: 1000 * 60 * 60 // 1 hour
    });
    
    // Initialize common metrics
    this.metrics.set('api_response_time', metricCache);
    this.metrics.set('db_query_latency', metricCache);
    this.metrics.set('matching_engine_latency', metricCache);
    this.metrics.set('feed_generation_latency', metricCache);
    this.metrics.set('resume_upload_success', metricCache);
    this.metrics.set('resume_download_success', metricCache);
    this.metrics.set('scraper_success_rate', metricCache);
  }

  /**
   * Record a metric value
   */
  recordMetric(metricName: string, value: number): void {
    const cache = this.metrics.get(metricName);
    if (cache) {
      cache.set(Date.now().toString(), {
        timestamp: Date.now(),
        value: value
      });
    }
  }

  /**
   * Get metric statistics
   */
  getMetricStats(metricName: string, timeframeMs: number = 60 * 60 * 1000): {
    avg: number;
    p95: number;
    p99: number;
    count: number;
  } {
    const cache = this.metrics.get(metricName);
    if (!cache) {
      return { avg: 0, p95: 0, p99: 0, count: 0 };
    }

    const cutoffTime = Date.now() - timeframeMs;
    const values: number[] = [];

    // Collect values within timeframe
    for (const [key, metric] of cache.entries()) {
      if (metric.timestamp > cutoffTime) {
        values.push(metric.value);
      }
    }

    if (values.length === 0) {
      return { avg: 0, p95: 0, p99: 0, count: 0 };
    }

    // Sort values for percentile calculation
    values.sort((a, b) => a - b);

    // Calculate statistics
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const p95Index = Math.floor(values.length * 0.95);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      avg: parseFloat(avg.toFixed(2)),
      p95: parseFloat(values[p95Index].toFixed(2)),
      p99: parseFloat(values[p99Index].toFixed(2)),
      count: values.length
    };
  }

  /**
   * Check if alert thresholds are exceeded
   */
  checkAlerts(): { metric: string; currentValue: number; threshold: number; message: string }[] {
    const alerts: { metric: string; currentValue: number; threshold: number; message: string }[] = [];
    
    // API response time alert
    const apiStats = this.getMetricStats('api_response_time');
    if (apiStats.avg > 100) {
      alerts.push({
        metric: 'API Response Time',
        currentValue: apiStats.avg,
        threshold: 100,
        message: `API response time average ${apiStats.avg}ms exceeds threshold of 100ms`
      });
    }
    
    // DB query latency alert
    const dbStats = this.getMetricStats('db_query_latency');
    if (dbStats.avg > 25) {
      alerts.push({
        metric: 'Database Query Latency',
        currentValue: dbStats.avg,
        threshold: 25,
        message: `Database query latency average ${dbStats.avg}ms exceeds threshold of 25ms`
      });
    }
    
    // Matching engine latency alert
    const matchingStats = this.getMetricStats('matching_engine_latency');
    if (matchingStats.avg > 50) {
      alerts.push({
        metric: 'Matching Engine Latency',
        currentValue: matchingStats.avg,
        threshold: 50,
        message: `Matching engine latency average ${matchingStats.avg}ms exceeds threshold of 50ms`
      });
    }
    
    // Feed generation latency alert
    const feedStats = this.getMetricStats('feed_generation_latency');
    if (feedStats.avg > 100) {
      alerts.push({
        metric: 'Feed Generation Latency',
        currentValue: feedStats.avg,
        threshold: 100,
        message: `Feed generation latency average ${feedStats.avg}ms exceeds threshold of 100ms`
      });
    }
    
    // Resume upload success rate alert
    const uploadStats = this.getMetricStats('resume_upload_success');
    if (uploadStats.avg < 99) {
      alerts.push({
        metric: 'Resume Upload Success Rate',
        currentValue: uploadStats.avg,
        threshold: 99,
        message: `Resume upload success rate ${uploadStats.avg}% below threshold of 99%`
      });
    }
    
    return alerts;
  }
}

export const metricsCollector = new MetricsCollector();