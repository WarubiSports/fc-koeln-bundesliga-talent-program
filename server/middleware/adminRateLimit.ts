import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Simple in-memory store for admin rate limiting
const adminRequests = new Map<string, number[]>();

const ADMIN_RATE_LIMIT = 30; // 30 requests per minute for admin endpoints
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Middleware: Rate limit admin endpoints to protect against brute force attacks
 * More restrictive than app rate limits
 */
export function adminRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get request timestamps for this IP
  let requests = adminRequests.get(ip) || [];
  
  // Filter out requests outside the current window
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (requests.length >= ADMIN_RATE_LIMIT) {
    const oldestRequest = requests[0];
    const resetTime = oldestRequest + WINDOW_MS;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    logger.warn('Admin rate limit exceeded', {
      ip,
      requests: requests.length,
      limit: ADMIN_RATE_LIMIT,
    });

    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many admin requests. Please try again in ${retryAfter} seconds.`,
      retryAfter,
    });
  }

  // Add current request
  requests.push(now);
  adminRequests.set(ip, requests);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', String(ADMIN_RATE_LIMIT));
  res.setHeader('X-RateLimit-Remaining', String(ADMIN_RATE_LIMIT - requests.length));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil((now + WINDOW_MS) / 1000)));

  next();
}
