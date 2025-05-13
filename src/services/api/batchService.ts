
/**
 * Request batching service to optimize API calls
 */

type BatchRequest<T> = {
  id: string;
  execute: () => Promise<T>;
  priority: number; // Higher number = higher priority
  resolve: (value: T) => void;
  reject: (reason: any) => void;
};

class RequestBatcher {
  private queue: BatchRequest<any>[] = [];
  private isProcessing: boolean = false;
  private concurrencyLimit: number;
  private processingDelay: number;
  
  constructor(concurrencyLimit: number = 3, processingDelay: number = 100) {
    this.concurrencyLimit = concurrencyLimit;
    this.processingDelay = processingDelay;
  }
  
  /**
   * Add a request to the batching queue
   */
  public add<T>(
    id: string,
    execute: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    // Check if a request with this ID is already in the queue
    const existingRequestIndex = this.queue.findIndex(req => req.id === id);
    
    if (existingRequestIndex >= 0) {
      // Return the promise from the existing request
      return new Promise<T>((resolve, reject) => {
        this.queue[existingRequestIndex].resolve = resolve;
        this.queue[existingRequestIndex].reject = reject;
      });
    }
    
    // Create a new promise for this request
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id,
        execute,
        priority,
        resolve,
        reject
      });
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.process();
      }
    });
  }
  
  /**
   * Process the batched requests
   */
  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // Give a small delay to allow more requests to be batched together
    await new Promise(resolve => setTimeout(resolve, this.processingDelay));
    
    // Sort by priority (higher number = higher priority)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    // Execute requests up to the concurrency limit
    const batch = this.queue.splice(0, this.concurrencyLimit);
    
    try {
      const results = await Promise.allSettled(batch.map(request => {
        return request.execute()
          .then(result => {
            request.resolve(result);
            return result;
          })
          .catch(error => {
            request.reject(error);
            throw error;
          });
      }));
      
      console.debug(`Batch processed ${batch.length} requests:`, results);
    } catch (error) {
      console.error("Error processing batch:", error);
    }
    
    this.isProcessing = false;
    
    // Continue processing if there are more items in the queue
    if (this.queue.length > 0) {
      this.process();
    }
  }
  
  /**
   * Clear all pending requests with an error
   */
  public clearQueue(reason: string = "Queue cleared"): void {
    const pendingRequests = [...this.queue];
    this.queue = [];
    
    pendingRequests.forEach(request => {
      request.reject(new Error(reason));
    });
  }
  
  /**
   * Get the number of pending requests
   */
  public get pendingCount(): number {
    return this.queue.length;
  }
}

// Export a singleton instance
export const batchService = new RequestBatcher();

// Helper functions for more convenient use
export const batchRequest = <T>(
  id: string,
  execute: () => Promise<T>,
  priority: number = 0
): Promise<T> => {
  return batchService.add(id, execute, priority);
};

export const clearBatchQueue = (reason?: string): void => {
  batchService.clearQueue(reason);
};

export const getPendingCount = (): number => {
  return batchService.pendingCount;
};
