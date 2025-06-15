interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly STORAGE_KEY = 'assessment_performance_metrics';

  startTimer(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    
    this.metrics.set(name, metric);
    console.log(`🚀 Started: ${name}`, metadata);
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Timer not found: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    console.log(`✅ Completed: ${name} in ${duration.toFixed(2)}ms`, metric.metadata);
    
    // Store in localStorage for analysis
    this.storeMetric(metric);
    
    return duration;
  }

  private storeMetric(metric: PerformanceMetric): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const metrics = stored ? JSON.parse(stored) : [];
      
      metrics.push({
        ...metric,
        timestamp: Date.now()
      });
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to store performance metric:', error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve performance metrics:', error);
      return [];
    }
  }

  clearMetrics(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.metrics.clear();
  }

  getAverageTime(metricName: string): number {
    const allMetrics = this.getMetrics();
    const matchingMetrics = allMetrics.filter(m => m.name === metricName && m.duration);
    
    if (matchingMetrics.length === 0) return 0;
    
    const totalTime = matchingMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalTime / matchingMetrics.length;
  }
}

export const performanceMonitor = new PerformanceMonitor();
