import type { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter per app
 * Tracks request counts per app ID in a sliding window
 */

interface RateLimitStore {
  [appId: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute

export function rateLimitPerApp(req: Request, res: Response, next: NextFunction) {
  const appCtx = req.appCtx;
  
  if (!appCtx) {
    // No app context means authentication middleware didn't run
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const appId = appCtx.id;
  const now = Date.now();
  
  // Initialize or reset counter if window expired
  if (!store[appId] || store[appId].resetAt < now) {
    store[appId] = {
      count: 0,
      resetAt: now + WINDOW_MS
    };
  }

  // Increment counter
  store[appId].count++;

  // Check if limit exceeded
  if (store[appId].count > appCtx.rps) {
    const retryAfter = Math.ceil((store[appId].resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.setHeader('X-RateLimit-Limit', appCtx.rps.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', store[appId].resetAt.toString());
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${appCtx.rps} requests per minute`,
      retryAfter
    });
  }

  // Add rate limit headers
  const remaining = appCtx.rps - store[appId].count;
  res.setHeader('X-RateLimit-Limit', appCtx.rps.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', store[appId].resetAt.toString());

  next();
}
