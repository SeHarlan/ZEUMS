import { kv } from "@vercel/kv";

/**
 * Redis key prefixes
 */
const LOCK_PREFIX = "img:lock:";
const NEGATIVE_CACHE_PREFIX = "img:neg:";
const READY_PREFIX = "img:ready:";
const ACCESS_PREFIX = "img:access:";

/**
 * Lock TTL in milliseconds (15 seconds)
 */
const LOCK_TTL_MS = 15000;

/**
 * Negative cache TTL in seconds (60 seconds to 10 minutes)
 */
const NEGATIVE_CACHE_TTL = 300; // 5 minutes

/**
 * Ready flag TTL in seconds (1 hour)
 */
const READY_TTL = 3600;

/**
 * Acquire a distributed lock for image processing
 * Prevents duplicate processing when multiple requests come in simultaneously
 * 
 * @param key - Cache key to lock
 * @returns true if lock acquired, false otherwise
 */
export async function acquireLock(key: string): Promise<boolean> {
  try {
    const lockKey = `${LOCK_PREFIX}${key}`;
    const result = await kv.set(lockKey, "1", {
      ex: Math.ceil(LOCK_TTL_MS / 1000), // Convert to seconds
      nx: true, // Only set if not exists
    });
    
    return result === "OK";
  } catch (error) {
    console.error("Failed to acquire lock:", error);
    return false;
  }
}

/**
 * Release a distributed lock
 * 
 * @param key - Cache key to unlock
 */
export async function releaseLock(key: string): Promise<void> {
  try {
    const lockKey = `${LOCK_PREFIX}${key}`;
    await kv.del(lockKey);
  } catch (error) {
    console.error("Failed to release lock:", error);
  }
}

/**
 * Check if a request should be negatively cached (failed recently)
 * 
 * @param key - Cache key to check
 * @returns true if negatively cached, false otherwise
 */
export async function isNegativelyCached(key: string): Promise<boolean> {
  try {
    const negKey = `${NEGATIVE_CACHE_PREFIX}${key}`;
    const result = await kv.get(negKey);
    return result !== null;
  } catch (error) {
    console.error("Failed to check negative cache:", error);
    return false;
  }
}

/**
 * Set negative cache for a failed request
 * 
 * @param key - Cache key that failed
 */
export async function setNegativeCache(key: string): Promise<void> {
  try {
    const negKey = `${NEGATIVE_CACHE_PREFIX}${key}`;
    await kv.set(negKey, "1", { ex: NEGATIVE_CACHE_TTL });
  } catch (error) {
    console.error("Failed to set negative cache:", error);
  }
}

/**
 * Check if image is ready (for async processing)
 * 
 * @param key - Cache key to check
 * @returns true if ready, false otherwise
 */
export async function isReady(key: string): Promise<boolean> {
  try {
    const readyKey = `${READY_PREFIX}${key}`;
    const result = await kv.get(readyKey);
    return result !== null;
  } catch (error) {
    console.error("Failed to check ready flag:", error);
    return false;
  }
}

/**
 * Set ready flag for async processed image
 * 
 * @param key - Cache key that's ready
 */
export async function setReady(key: string): Promise<void> {
  try {
    const readyKey = `${READY_PREFIX}${key}`;
    await kv.set(readyKey, "1", { ex: READY_TTL });
  } catch (error) {
    console.error("Failed to set ready flag:", error);
  }
}

/**
 * Track last access time for a cached image
 * Used for cache cleanup of stale images
 * 
 * @param key - Cache key that was accessed
 */
export async function trackAccess(key: string): Promise<void> {
  try {
    const accessKey = `${ACCESS_PREFIX}${key}`;
    const timestamp = Date.now();
    // Store with no expiration - we'll clean up manually based on access time
    await kv.set(accessKey, timestamp.toString());
  } catch (error) {
    console.error("Failed to track access:", error);
  }
}

/**
 * Get last access time for a cached image
 * 
 * @param key - Cache key to check
 * @returns Last access timestamp in milliseconds, or null if never accessed
 */
export async function getLastAccess(key: string): Promise<number | null> {
  try {
    const accessKey = `${ACCESS_PREFIX}${key}`;
    const result = await kv.get<string>(accessKey);
    return result ? parseInt(result, 10) : null;
  } catch (error) {
    console.error("Failed to get last access:", error);
    return null;
  }
}

/**
 * Get all cached images with their last access times
 * Useful for finding stale images to delete
 * 
 * @param maxAge - Maximum age in milliseconds (optional filter)
 * @returns Array of { key, lastAccess } for images older than maxAge
 */
export async function getStaleImages(maxAge?: number): Promise<Array<{ key: string; lastAccess: number }>> {
  try {
    const pattern = `${ACCESS_PREFIX}*`;
    const keys = await kv.keys(pattern);
    const now = Date.now();
    const staleImages: Array<{ key: string; lastAccess: number }> = [];

    for (const accessKey of keys) {
      const cacheKey = accessKey.replace(ACCESS_PREFIX, "");
      const timestampStr = await kv.get<string>(accessKey);
      
      if (timestampStr) {
        const lastAccess = parseInt(timestampStr, 10);
        const age = now - lastAccess;
        
        if (!maxAge || age > maxAge) {
          staleImages.push({ key: cacheKey, lastAccess });
        }
      }
    }

    // Sort by last access (oldest first)
    return staleImages.sort((a, b) => a.lastAccess - b.lastAccess);
  } catch (error) {
    console.error("Failed to get stale images:", error);
    return [];
  }
}

/**
 * Remove access tracking for a cache key
 * Call this when deleting a cached image
 * 
 * @param key - Cache key to remove access tracking for
 */
export async function removeAccessTracking(key: string): Promise<void> {
  try {
    const accessKey = `${ACCESS_PREFIX}${key}`;
    await kv.del(accessKey);
  } catch (error) {
    console.error("Failed to remove access tracking:", error);
  }
}
