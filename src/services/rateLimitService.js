import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_LIMIT_CONFIG = {
  // Rate limit for AI chat requests (AskDoubtScreen)
  'quran/ask': {
    maxRequests: 30, // Maximum requests allowed
    windowMs: 60 * 60 * 1000, // Time window in milliseconds (1 hour)
    storageKey: 'rate_limit_ask',
  },
  // Rate limit for tafseer requests (QuranPageScreen)
  'quran/tafseer': {
    maxRequests: 20, // Maximum requests allowed
    windowMs: 60 * 60 * 1000, // Time window in milliseconds (1 hour)
    storageKey: 'rate_limit_tafseer',
  },
};

class RateLimitService {
  /**
   * Check if a request is allowed based on rate limiting rules
   * @param {string} endpoint - The API endpoint (e.g., 'quran/ask', 'quran/tafseer')
   * @returns {Promise<{allowed: boolean, resetTime?: number, remainingRequests?: number}>}
   */
  async checkRateLimit(endpoint) {
    const config = RATE_LIMIT_CONFIG[endpoint];
    if (!config) {
      // No rate limit configured for this endpoint
      return { allowed: true };
    }

    try {
      const storedData = await AsyncStorage.getItem(config.storageKey);
      const now = Date.now();
      
      let requestData = {
        requests: [],
        windowStart: now,
      };

      if (storedData) {
        requestData = JSON.parse(storedData);
      }

      // Clean up old requests that are outside the current window
      const windowStart = now - config.windowMs;
      requestData.requests = requestData.requests.filter(
        timestamp => timestamp > windowStart
      );

      // Check if we've exceeded the rate limit
      if (requestData.requests.length >= config.maxRequests) {
        const oldestRequest = Math.min(...requestData.requests);
        const resetTime = oldestRequest + config.windowMs;
        
        return {
          allowed: false,
          resetTime,
          remainingRequests: 0,
          maxRequests: config.maxRequests,
          windowMs: config.windowMs,
        };
      }

      // Request is allowed
      return {
        allowed: true,
        remainingRequests: config.maxRequests - requestData.requests.length,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // In case of error, allow the request
      return { allowed: true };
    }
  }

  /**
   * Record a successful request
   * @param {string} endpoint - The API endpoint
   */
  async recordRequest(endpoint) {
    const config = RATE_LIMIT_CONFIG[endpoint];
    if (!config) return;

    try {
      const storedData = await AsyncStorage.getItem(config.storageKey);
      const now = Date.now();
      
      let requestData = {
        requests: [],
        windowStart: now,
      };

      if (storedData) {
        requestData = JSON.parse(storedData);
      }

      // Clean up old requests
      const windowStart = now - config.windowMs;
      requestData.requests = requestData.requests.filter(
        timestamp => timestamp > windowStart
      );

      // Add current request
      requestData.requests.push(now);

      // Save updated data
      await AsyncStorage.setItem(config.storageKey, JSON.stringify(requestData));
    } catch (error) {
      console.error('Error recording request:', error);
    }
  }

  /**
   * Reset rate limit for a specific endpoint (useful for testing or admin purposes)
   * @param {string} endpoint - The API endpoint
   */
  async resetRateLimit(endpoint) {
    const config = RATE_LIMIT_CONFIG[endpoint];
    if (!config) return;

    try {
      await AsyncStorage.removeItem(config.storageKey);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  /**
   * Get current rate limit status for all endpoints
   * @returns {Promise<Object>} Status for all endpoints
   */
  async getRateLimitStatus() {
    const status = {};
    
    for (const endpoint of Object.keys(RATE_LIMIT_CONFIG)) {
      const result = await this.checkRateLimit(endpoint);
      status[endpoint] = result;
    }
    
    return status;
  }

  /**
   * Format time remaining until reset
   * @param {number} resetTime - Timestamp when rate limit resets
   * @returns {string} Human readable time remaining
   */
  getTimeUntilReset(resetTime) {
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) return 'Now';
    
    const minutes = Math.ceil(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    return `${minutes}m`;
  }
}

// Create and export a singleton instance
const rateLimitService = new RateLimitService();
export default rateLimitService;

// Export the class for testing purposes
export { RateLimitService };
