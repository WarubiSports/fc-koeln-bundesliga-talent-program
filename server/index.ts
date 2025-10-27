import "./config/validateEnv.js";
import 'dotenv/config';
import express from 'express';
import { attachAppContext } from './middleware/appContext.js';
import { corsPerApp } from './middleware/corsPerApp.js';
import { rateLimitPerApp } from './middleware/rateLimit.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';
import { pool } from './db.js';

const app = express();

// Parse JSON
app.use(express.json());

// Request logging (before all routes)
app.use(requestLogger);

// Public health endpoints (no auth required)
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/healthz/ready', async (_req, res) => {
  try {
    // Check database connectivity
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({ 
      status: 'unavailable',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({ 
    name: 'Warubi Platform',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs'
  });
});

// ============================================
// Protected Routes (require app authentication)
// ============================================

// Apply middleware chain for all /api/* routes
app.use('/api/*', attachAppContext);
app.use('/api/*', corsPerApp);
app.use('/api/*', rateLimitPerApp);

// Metrics collection (after auth, before routes)
import { metricsCollector, getAllMetrics } from './middleware/metrics.js';
app.use('/api/*', metricsCollector);

// Ping endpoint (authenticated)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    pong: true,
    app: req.appCtx?.name,
    timestamp: new Date().toISOString()
  });
});

// Platform info endpoint
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

// Metrics endpoint (for monitoring)
app.get('/api/metrics', (req, res) => {
  const appId = req.appCtx?.id;
  
  if (!appId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { getAppMetrics } = require('./middleware/metrics.js');
  const metrics = getAppMetrics(appId);

  res.status(200).json({
    success: true,
    appId,
    metrics,
  });
});

// App-specific routes (mounted under /api) - ES Module version
import fckolnRoutes from './routes/fckoln.mjs';
app.use('/api', fckolnRoutes);

// Admin routes (for managing apps) - PROTECTED by admin authentication
import adminRoutes from './routes/admin.js';
import { requireAdminAuth } from './middleware/adminAuth.js';
import { adminRateLimit } from './middleware/adminRateLimit.js';
app.use('/admin', adminRateLimit, requireAdminAuth, adminRoutes);

// Error logging middleware (before error handler)
app.use(errorLogger);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    correlationId: req.correlationId, // Include correlation ID for debugging
  });
});

// Start server
const PORT = Number(process.env.PORT || 5000);
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('Warubi Platform started', { 
    port: PORT, 
    env: process.env.NODE_ENV || 'development',
    defaultApp: 'fckoln' 
  });
  console.log(`🚀 Warubi Multi-App Platform`);
  console.log(`📍 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Apps registered: core, fckoln`);
  console.log(`✅ FC Köln auto-enabled for localhost requests`);
});

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  logger.info('Shutdown signal received', { signal });
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await pool.end();
      logger.info('Database connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
