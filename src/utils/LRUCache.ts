
/**
 * Simple LRU (Least Recently Used) Cache implementation
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; timestamp: number; ttl?: number }>;
  private accessOrder: K[];

  constructor(capacity: number = 50) {
    this.capacity = capacity;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key: K): V | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check TTL if set
    if (item.ttl && Date.now() > item.timestamp + item.ttl) {
      this.delete(key);
      return null;
    }
    
    // Move to end (most recently used)
    this.moveToEnd(key);
    return item.value;
  }

  set(key: K, value: V, ttl?: number): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.set(key, { value, timestamp: Date.now(), ttl });
      this.moveToEnd(key);
    } else {
      // Add new
      if (this.cache.size >= this.capacity) {
        this.evictLeastRecentlyUsed();
      }
      
      this.cache.set(key, { value, timestamp: Date.now(), ttl });
      this.accessOrder.push(key);
    }
  }

  delete(key: K): boolean {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  private moveToEnd(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder.shift()!;
      this.cache.delete(lruKey);
    }
  }
}
