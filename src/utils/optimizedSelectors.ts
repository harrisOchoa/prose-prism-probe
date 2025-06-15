
import { useMemo, useCallback } from 'react';
import { shallowEqual } from './shallowCompare';

// Optimized data selectors with memoization to prevent unnecessary recalculations
export const useAssessmentSelectors = (assessmentData: any) => {
  // Memoize complex data transformations
  const writingScoresWithMetadata = useMemo(() => {
    if (!assessmentData?.writingScores) return [];
    
    return assessmentData.writingScores.map((score: any, index: number) => ({
      ...score,
      index,
      hasValidScore: score.score > 0,
      prompt: assessmentData.writingPrompts?.[index] || {},
      response: assessmentData.writingResponses?.[index] || {}
    }));
  }, [assessmentData?.writingScores, assessmentData?.writingPrompts, assessmentData?.writingResponses]);

  const aptitudeCategories = useMemo(() => {
    return assessmentData?.aptitudeCategories || [];
  }, [assessmentData?.aptitudeCategories]);

  const antiCheatingMetrics = useMemo(() => {
    return assessmentData?.antiCheatingMetrics || null;
  }, [assessmentData?.antiCheatingMetrics]);

  // Memoized validation functions
  const hasValidWritingScores = useCallback(() => {
    return writingScoresWithMetadata.some((score: any) => score.hasValidScore);
  }, [writingScoresWithMetadata]);

  const hasValidAptitudeData = useCallback(() => {
    return assessmentData?.aptitudeScore > 0 && assessmentData?.aptitudeTotal > 0;
  }, [assessmentData?.aptitudeScore, assessmentData?.aptitudeTotal]);

  const hasAdvancedAnalysis = useCallback(() => {
    return !!(assessmentData?.advancedAnalysis && Object.keys(assessmentData.advancedAnalysis).length > 0);
  }, [assessmentData?.advancedAnalysis]);

  return {
    writingScoresWithMetadata,
    aptitudeCategories,
    antiCheatingMetrics,
    hasValidWritingScores,
    hasValidAptitudeData,
    hasAdvancedAnalysis
  };
};

// Request debouncing utility
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Cache with TTL (Time To Live) for API responses
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private ttl: number;

  constructor(ttlSeconds: number = 300) { // Default 5 minutes
    this.ttl = ttlSeconds * 1000;
  }

  set(key: K, value: V): void {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Global cache instance for assessment data
export const assessmentCache = new TTLCache<string, any>(300); // 5 minutes TTL
