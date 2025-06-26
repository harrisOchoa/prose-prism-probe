
import { StrictAssessmentData, PerformanceMetrics } from '@/types/optimized';

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderCache: Map<string, any> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Memoize expensive calculations
  memoizeCalculation<T>(key: string, calculation: () => T): T {
    if (this.renderCache.has(key)) {
      return this.renderCache.get(key);
    }
    
    const result = calculation();
    this.renderCache.set(key, result);
    return result;
  }

  // Track component render performance
  trackRenderTime(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName);
    // Safely access memory if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    
    this.metrics.set(componentName, {
      componentRenderTime: renderTime,
      apiResponseTime: existing?.apiResponseTime || 0,
      cacheHitRate: existing?.cacheHitRate || 0,
      memoryUsage
    });
  }

  // Get performance metrics for monitoring
  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Clear cache when needed
  clearCache(): void {
    this.renderCache.clear();
  }

  // Optimize assessment data for rendering
  optimizeAssessmentData(data: StrictAssessmentData): StrictAssessmentData {
    // Remove unnecessary nested objects for rendering
    const optimized = {
      ...data,
      // Flatten nested structures for better performance
      hasValidAptitudeData: !!(data.aptitudeScore && data.aptitudeTotal),
      hasValidWritingData: !!(data.writingScores && data.writingScores.length > 0),
      hasAntiCheatingData: !!data.antiCheatingMetrics
    };

    return optimized;
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
