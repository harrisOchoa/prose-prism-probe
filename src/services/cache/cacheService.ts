
/**
 * Client-side caching service for optimizing API calls
 */

export interface CacheOptions {
  expiry?: number; // Time in milliseconds until cache expires
  namespace?: string; // Optional namespace for grouping related cache entries
}

const DEFAULT_EXPIRY = 1000 * 60 * 15; // 15 minutes default cache expiry
const STORAGE_PREFIX = 'assessment_cache_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Set data in the cache
 */
export const setCacheItem = <T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void => {
  const { expiry = DEFAULT_EXPIRY, namespace = '' } = options;
  const storageKey = `${STORAGE_PREFIX}${namespace ? `${namespace}_` : ''}${key}`;
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiry,
  };
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Error setting cache item:', error);
  }
};

/**
 * Get data from the cache
 */
export const getCacheItem = <T>(
  key: string,
  options: CacheOptions = {}
): T | null => {
  const { namespace = '' } = options;
  const storageKey = `${STORAGE_PREFIX}${namespace ? `${namespace}_` : ''}${key}`;
  
  try {
    const entryJson = localStorage.getItem(storageKey);
    if (!entryJson) return null;
    
    const entry: CacheEntry<T> = JSON.parse(entryJson);
    const now = Date.now();
    
    // Check if cache entry has expired
    if (now - entry.timestamp > entry.expiry) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error('Error getting cache item:', error);
    return null;
  }
};

/**
 * Remove an item from the cache
 */
export const removeCacheItem = (
  key: string,
  options: CacheOptions = {}
): void => {
  const { namespace = '' } = options;
  const storageKey = `${STORAGE_PREFIX}${namespace ? `${namespace}_` : ''}${key}`;
  
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error removing cache item:', error);
  }
};

/**
 * Clear all cached items, optionally filtering by namespace
 */
export const clearCache = (namespace?: string): void => {
  try {
    if (namespace) {
      // Clear only items in the specified namespace
      const nsPrefix = `${STORAGE_PREFIX}${namespace}_`;
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(nsPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear all cached items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get all cached items for a namespace
 */
export const getCacheItems = <T>(namespace: string): Record<string, T> => {
  const nsPrefix = `${STORAGE_PREFIX}${namespace}_`;
  const result: Record<string, T> = {};
  
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(nsPrefix)) {
        const entryJson = localStorage.getItem(key);
        if (entryJson) {
          const entry: CacheEntry<T> = JSON.parse(entryJson);
          const now = Date.now();
          
          // Skip expired entries
          if (now - entry.timestamp <= entry.expiry) {
            const itemKey = key.replace(nsPrefix, '');
            result[itemKey] = entry.data;
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting cache items:', error);
  }
  
  return result;
};
