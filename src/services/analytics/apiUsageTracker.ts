
/**
 * API Usage Tracking Service to monitor API calls and rate limits
 */

interface ApiUsageEvent {
  endpoint: string;
  timestamp: number;
  success: boolean;
  rateLimited: boolean;
  latency: number;
}

interface ApiUsageStats {
  totalCalls: number;
  successfulCalls: number;
  rateLimitedCalls: number;
  averageLatency: number;
  callsInLastMinute: number;
  callsInLastHour: number;
  lastRateLimitedTime: number | null;
}

export class ApiUsageTracker {
  private static instance: ApiUsageTracker;
  private events: ApiUsageEvent[] = [];
  private maxEventsStored: number = 1000;
  private storageKey: string = 'api_usage_stats';
  
  // Private constructor for singleton pattern
  private constructor() {
    this.loadFromStorage();
  }
  
  // Get singleton instance
  public static getInstance(): ApiUsageTracker {
    if (!ApiUsageTracker.instance) {
      ApiUsageTracker.instance = new ApiUsageTracker();
    }
    return ApiUsageTracker.instance;
  }
  
  /**
   * Track an API call
   */
  public trackApiCall(
    endpoint: string,
    success: boolean,
    rateLimited: boolean,
    startTime: number
  ): void {
    const event: ApiUsageEvent = {
      endpoint,
      timestamp: Date.now(),
      success,
      rateLimited,
      latency: Date.now() - startTime
    };
    
    this.events.push(event);
    
    // Trim events array if it gets too large
    if (this.events.length > this.maxEventsStored) {
      this.events = this.events.slice(-this.maxEventsStored);
    }
    
    this.saveToStorage();
  }
  
  /**
   * Get overall usage statistics
   */
  public getUsageStats(): ApiUsageStats {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const totalCalls = this.events.length;
    const successfulCalls = this.events.filter(e => e.success).length;
    const rateLimitedCalls = this.events.filter(e => e.rateLimited).length;
    
    const latencies = this.events.map(e => e.latency);
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length 
      : 0;
    
    const callsInLastMinute = this.events.filter(e => e.timestamp >= oneMinuteAgo).length;
    const callsInLastHour = this.events.filter(e => e.timestamp >= oneHourAgo).length;
    
    const rateLimitedEvents = this.events.filter(e => e.rateLimited);
    const lastRateLimitedTime = rateLimitedEvents.length > 0 
      ? Math.max(...rateLimitedEvents.map(e => e.timestamp))
      : null;
    
    return {
      totalCalls,
      successfulCalls,
      rateLimitedCalls,
      averageLatency,
      callsInLastMinute,
      callsInLastHour,
      lastRateLimitedTime
    };
  }
  
  /**
   * Check if we're likely to hit a rate limit soon
   */
  public isRateLimitLikely(): boolean {
    const stats = this.getUsageStats();
    
    // Define thresholds that indicate potential rate limiting
    // These would need to be tuned based on the actual API limits
    const HIGH_CALLS_PER_MINUTE = 10;
    const HIGH_RECENT_RATE_LIMIT = 5 * 60 * 1000; // 5 minutes
    
    return (
      stats.callsInLastMinute > HIGH_CALLS_PER_MINUTE ||
      (stats.lastRateLimitedTime !== null && 
       Date.now() - stats.lastRateLimitedTime < HIGH_RECENT_RATE_LIMIT)
    );
  }
  
  /**
   * Get usage data for a specific endpoint
   */
  public getEndpointStats(endpoint: string): ApiUsageStats {
    const endpointEvents = this.events.filter(e => e.endpoint === endpoint);
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const totalCalls = endpointEvents.length;
    const successfulCalls = endpointEvents.filter(e => e.success).length;
    const rateLimitedCalls = endpointEvents.filter(e => e.rateLimited).length;
    
    const latencies = endpointEvents.map(e => e.latency);
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length 
      : 0;
    
    const callsInLastMinute = endpointEvents.filter(e => e.timestamp >= oneMinuteAgo).length;
    const callsInLastHour = endpointEvents.filter(e => e.timestamp >= oneHourAgo).length;
    
    const rateLimitedEvents = endpointEvents.filter(e => e.rateLimited);
    const lastRateLimitedTime = rateLimitedEvents.length > 0 
      ? Math.max(...rateLimitedEvents.map(e => e.timestamp))
      : null;
    
    return {
      totalCalls,
      successfulCalls,
      rateLimitedCalls,
      averageLatency,
      callsInLastMinute,
      callsInLastHour,
      lastRateLimitedTime
    };
  }
  
  /**
   * Save events to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving API usage data to localStorage:', error);
    }
  }
  
  /**
   * Load events from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedEvents = localStorage.getItem(this.storageKey);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Error loading API usage data from localStorage:', error);
    }
  }
  
  /**
   * Clear stored usage data
   */
  public clearStoredData(): void {
    this.events = [];
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const apiUsageTracker = ApiUsageTracker.getInstance();

// Helper functions for more convenient use
export const trackApiCall = (
  endpoint: string, 
  success: boolean, 
  rateLimited: boolean, 
  startTime: number
): void => {
  apiUsageTracker.trackApiCall(endpoint, success, rateLimited, startTime);
};

export const getApiUsageStats = (): ApiUsageStats => {
  return apiUsageTracker.getUsageStats();
};

export const isRateLimitLikely = (): boolean => {
  return apiUsageTracker.isRateLimitLikely();
};
