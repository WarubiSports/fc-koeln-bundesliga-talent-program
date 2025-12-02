import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { attachAppContext } from './middleware/appContext.js';
import { corsPerApp } from './middleware/corsPerApp.js';
import { rateLimitPerApp } from './middleware/rateLimit.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { jsonParseErrorHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { metricsCollector, getAllMetrics, getAppMetrics } from './middleware/metrics.js';
import { pool } from './db.js';
// @ts-ignore - fckoln routes
import fckolnRoutes from './routes/fckoln.mjs';
// @ts-ignore - evaluation routes  
import evaluationsRoutes from './routes/evaluations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppConfig {
  skipStaticFiles?: boolean;
  skipRequestLogging?: boolean;
  skipRateLimit?: boolean;
  testAppContext?: { id: string; name: string; origins: string[]; rps: number };
}

export function createApp(config: AppConfig = {}): Express {
  const app = express();

  if (!config.skipStaticFiles) {
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../client/client-dist')));
  }

  app.use(express.json());

  if (!config.skipRequestLogging) {
    app.use(requestLogger);
  }

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/healthz/ready', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ 
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unavailable',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.use('/public', evaluationsRoutes);

  if (config.testAppContext) {
    app.use('/api/*', (req: Request, _res: Response, next: NextFunction) => {
      req.appCtx = config.testAppContext;
      next();
    });
  } else {
    app.use('/api/*', attachAppContext);
  }
  
  app.use('/api/*', corsPerApp);
  
  if (!config.skipRateLimit) {
    app.use('/api/*', rateLimitPerApp);
  }
  
  app.use('/api/*', metricsCollector);

  app.get('/api/ping', (req, res) => {
    res.status(200).json({ 
      pong: true,
      app: req.appCtx?.name,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/info', (req, res) => {
    res.status(200).json({
      platform: 'Warubi Multi-App Backend',
      version: '1.0.0',
      app: {
        id: req.appCtx?.id,
        name: req.appCtx?.name,
      },
      rateLimit: {
        limit: req.appCtx?.rps,
        remaining: res.getHeader('X-RateLimit-Remaining'),
      }
    });
  });

  app.get('/api/metrics', (req, res) => {
    const appId = req.appCtx?.id;
    
    if (!appId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const metrics = getAppMetrics(appId);
    res.status(200).json({
      success: true,
      appId,
      metrics,
    });
  });

  app.use('/api/fckoln', fckolnRoutes);

  app.use(jsonParseErrorHandler);
  app.use(errorLogger);
  app.use(globalErrorHandler);

  return app;
}

export function createTestApp(testAppId: string = 'fckoln'): Express {
  return createApp({
    skipStaticFiles: true,
    skipRequestLogging: true,
    skipRateLimit: true,
    testAppContext: {
      id: testAppId,
      name: '1.FC Köln ITP',
      origins: ['http://localhost:5000'],
      rps: 600
    }
  });
}

export { pool };
