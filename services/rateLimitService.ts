/**
 * Rate Limiting Service
 * Prevents API abuse by limiting the number of requests per time window
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: Record<string, RateLimitConfig> = {
    // Default limits for different endpoints
    search: { maxRequests: 30, windowMs: 60000 }, // 30 requests per minute
    contact: { maxRequests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
    favorite: { maxRequests: 50, windowMs: 60000 }, // 50 requests per minute
    newsletter: { maxRequests: 3, windowMs: 3600000 }, // 3 requests per hour
    default: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  };

  /**
   * Check if a request is allowed for the given key
   * @param key - Unique identifier for the rate limit (e.g., 'search:userId' or 'contact:ip')
   * @param endpoint - Optional endpoint type to use specific config
   * @returns true if request is allowed, false if rate limit exceeded
   */
  isAllowed(key: string, endpoint: keyof typeof this.config | 'default' = 'default'): boolean {
    const now = Date.now();
    const config = this.config[endpoint] || this.config.default;
    const entry = this.limits.get(key);

    // No entry yet, create one
    if (!entry) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Window expired, reset
    if (now >= entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within window, check limit
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Limit exceeded
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, endpoint: keyof typeof this.config | 'default' = 'default'): number {
    const config = this.config[endpoint] || this.config.default;
    const entry = this.limits.get(key);

    if (!entry || Date.now() >= entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until reset in milliseconds
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clean up expired entries periodically
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Update config for a specific endpoint
   */
  setConfig(endpoint: string, config: RateLimitConfig): void {
    this.config[endpoint] = config;
  }
}

// Singleton instance
const rateLimitService = new RateLimitService();

// Cleanup expired entries every minute
setInterval(() => rateLimitService.cleanup(), 60000);

export default rateLimitService;
