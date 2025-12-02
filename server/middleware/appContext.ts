import type { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apps } from '../app-registry.schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      appCtx?: { id: string; name: string; origins: string[]; rps: number };
    }
  }
}

const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

/**
 * Middleware: Authenticate app via X-App-Key header and attach app context
 * Queries the apps table to validate API key and load app settings
 */
export async function attachAppContext(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const apiKey = req.headers['x-app-key'] as string | undefined;
    
    if (!apiKey) {
      const isProduction = process.env.NODE_ENV === 'production';
      const origin = req.headers.origin || req.headers.referer;
      const isLocalhost = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');
      
      if (!isProduction && isLocalhost) {
        logger.debug('Dev mode: auto-attaching fckoln context for localhost request');
        req.appCtx = {
          id: 'fckoln',
          name: '1.FC Köln ITP',
          origins: ['http://localhost:5173', 'http://localhost:5000'],
          rps: 600
        };
        return next();
      }
      
      if (isProduction) {
        logger.warn('Missing API key in production', { 
          path: req.path, 
          origin: origin || 'unknown'
        });
      }
    }
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Missing X-App-Key header',
        message: 'All requests must include a valid app API key' 
      });
    }

    // Hash the provided key to compare with stored hash
    const apiKeyHash = sha256(apiKey);

    // Query database for matching app
    const [app] = await db
      .select()
      .from(apps)
      .where(eq(apps.apiKeyHash, apiKeyHash))
      .limit(1);

    if (!app) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided app key is not recognized' 
      });
    }

    if (!app.active) {
      return res.status(403).json({ 
        error: 'App disabled',
        message: 'This app has been deactivated' 
      });
    }

    // Parse allowed origins from JSON string
    const origins = JSON.parse(app.allowedOrigins) as string[];

    // Attach app context to request
    req.appCtx = {
      id: app.id,
      name: app.name,
      origins,
      rps: app.rateLimitPerMin
    };

    next();
  } catch (error) {
    logger.error('App authentication error', error as Error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred while authenticating the app' 
    });
  }
}
