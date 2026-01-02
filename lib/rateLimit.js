

const RATE_LIMIT_WINDOW = 60 * 1000; 
const MAX_REQUESTS = 60; 


const rateLimitStore = new Map();

/**
 * @param {string} key 
 * @returns {boolean} - true if allowed, false if blocked
 */
export function rateLimit(key) {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, {
      count: 1,
      startTime: now,
    });
    return true;
  }

  // Reset window
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, {
      count: 1,
      startTime: now,
    });
    return true;
  }

  // Increment count
  record.count += 1;

  if (record.count > MAX_REQUESTS) {
    return false;
  }

  return true;
}
