import type { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apps } from '../app-registry.schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

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
    // Allow OPTIONS preflight requests to pass through without authentication
    // Preflights don't include custom headers like X-App-Key
    // CORS middleware will handle origin validation
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Extract API key from header
    let apiKey = req.headers['x-app-key'] as string | undefined;
    
    console.log('🔍 Auth Middleware:', {
      path: req.path,
      method: req.method,
      hasApiKey: !!apiKey,
      origin: req.headers.origin,
      referer: req.headers.referer,
      NODE_ENV: process.env.NODE_ENV
    });
    
    // DEVELOPMENT MODE: Allow same-origin requests without API key, default to fckoln
    if (!apiKey && process.env.NODE_ENV !== 'production') {
      const origin = req.headers.origin || req.headers.referer;
      const isLocalhost = !origin || origin.includes('localhost') || origin.includes('127.0.0.1');
      
      console.log('🔧 Development mode check:', { origin, isLocalhost });
      
      if (isLocalhost) {
        // Default to FC Köln app for development
        req.appCtx = {
          id: 'fckoln',
          name: '1.FC Köln ITP',
          origins: ['http://localhost:5173', 'http://localhost:5000'],
          rps: 600
        };
        console.log('✅ Auto-authenticated as fckoln (development)');
        return next();
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
    import('../utils/logger').then(({ logger }) => {
      logger.error('App authentication error', error);
    });
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred while authenticating the app' 
    });
  }
}
