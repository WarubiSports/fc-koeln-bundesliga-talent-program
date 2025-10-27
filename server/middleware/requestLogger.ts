import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import crypto from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

/**
 * Generate a unique correlation ID for request tracing
 */
function generateCorrelationId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Middleware: Log all incoming requests with correlation ID, timing, and context
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Generate correlation ID for request tracing
  req.correlationId = generateCorrelationId();
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function(this: Response, ...args: any[]) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    
    // Log response
    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      appId: req.appCtx?.id,
      appName: req.appCtx?.name,
    });

    // Call the original end function
    return originalEnd.apply(this, args);
  };

  next();
}

/**
 * Middleware: Log errors with full context
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const duration = req.startTime ? Date.now() - req.startTime : 0;

  logger.error('Request failed', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    duration: `${duration}ms`,
    appId: req.appCtx?.id,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });

  next(err);
}
