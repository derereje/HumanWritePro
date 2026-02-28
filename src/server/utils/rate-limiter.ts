// Rate limiting to prevent abuse and reduce costs

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  minInterval?: number; // Minimum time between requests
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // First request
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      lastRequest: now,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check if window has expired
  if (now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
      lastRequest: now,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Check minimum interval between requests (prevent rapid-fire abuse)
  if (config.minInterval) {
    const timeSinceLastRequest = now - entry.lastRequest;
    if (timeSinceLastRequest < config.minInterval) {
      return {
        allowed: false,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((config.minInterval - timeSinceLastRequest) / 1000),
      };
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  entry.lastRequest = now;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Different rate limits based on subscription plan
export const RATE_LIMITS = {
  free: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 requests per hour
    minInterval: 10 * 1000, // 10 seconds between requests
  },
  basic: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 50 requests per hour
    minInterval: 5 * 1000, // 5 seconds between requests
  },
  pro: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 100 requests per hour
    minInterval: 3 * 1000, // 3 seconds between requests
  },
  ultra: {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000, // 200 requests per hour
    minInterval: 2 * 1000, // 2 seconds between requests
  },
} as const;

export function getRateLimitForPlan(
  plan: string | null | undefined
): RateLimitConfig {
  const planKey = (plan?.toLowerCase() || 'free') as keyof typeof RATE_LIMITS;
  return RATE_LIMITS[planKey] || RATE_LIMITS.free;
}
