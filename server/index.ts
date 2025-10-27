import "./config/validateEnv.js";
import 'dotenv/config';
import express from 'express';
import { attachAppContext } from './middleware/appContext.js';
import { corsPerApp } from './middleware/corsPerApp.js';
import { rateLimitPerApp } from './middleware/rateLimit.js';
import { logger } from './utils/logger.js';
import { pool } from './db.js';

const app = express();

// Parse JSON
app.use(express.json());

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

// App-specific routes (mounted under /api)
// import fckolnRoutes from './routes/fckoln.js';
// app.use('/api', fckolnRoutes);
// TODO: Re-enable after fixing drizzle-orm type conflicts

// Admin routes (for managing apps) - PROTECTED by admin authentication
import adminRoutes from './routes/admin.js';
import { requireAdminAuth } from './middleware/adminAuth.js';
app.use('/admin', requireAdminAuth, adminRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
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
