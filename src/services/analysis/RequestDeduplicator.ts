
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly REQUEST_TTL = 30000; // 30 seconds

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = this.REQUEST_TTL
  ): Promise<T> {
    // Clean up expired requests
    this.cleanupExpiredRequests();
    
    const existing = this.pendingRequests.get(key);
    
    if (existing && (Date.now() - existing.timestamp) < ttl) {
      console.log(`🔄 Reusing existing request: ${key}`);
      return existing.promise;
    }
    
    console.log(`🆕 Creating new request: ${key}`);
    const promise = requestFn();
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });
    
    // Clean up after completion
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
    
    return promise;
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > this.REQUEST_TTL) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => {
      this.pendingRequests.delete(key);
    });
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
