import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware: Require admin authentication for sensitive endpoints
 * Uses X-Admin-Key header compared against ADMIN_API_KEY environment variable
 * 
 * SECURITY: In production, rotate this key regularly and restrict by IP
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'] as string | undefined;
  const validAdminKey = process.env.ADMIN_API_KEY;

  if (!validAdminKey) {
    logger.error('ADMIN_API_KEY not configured in environment');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Admin authentication not configured'
    });
  }

  if (!adminKey) {
    logger.warn('Admin endpoint accessed without credentials', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      error: 'Authentication required',
      message: 'X-Admin-Key header is required for admin endpoints'
    });
  }

  if (adminKey !== validAdminKey) {
    logger.warn('Admin endpoint accessed with invalid credentials', {
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({
      error: 'Access denied',
      message: 'Invalid admin credentials'
    });
  }

  // Valid admin key - allow access
  next();
}
