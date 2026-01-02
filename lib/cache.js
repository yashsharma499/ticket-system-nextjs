

const cacheStore = new Map();

/**
 * Get cached value
 * @param {string} key
 * @returns {any|null}
 */
export function getCache(key) {
  const cached = cacheStore.get(key);
  if (!cached) return null;

  const { value, expiresAt } = cached;

  if (Date.now() > expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return value;
}

/**
 * Set cache value
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export function setCache(key, value, ttlSeconds = 60) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a specific cache key
 * @param {string} key
 */
export function deleteCache(key) {
  cacheStore.delete(key);
}

/**
 * Clear all cache (useful after major updates)
 */
export function clearCache() {
  cacheStore.clear();
}
