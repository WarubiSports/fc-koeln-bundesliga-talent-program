// server/index.ts
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
app.set('trust proxy', 1);

// Health first
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});
app.get('/healthz/ready', (_req, res) => {
  res.send('OK');
});

// Version endpoint
const COMMIT = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_SHA || 'unknown';
app.get('/version', (_req, res) => {
  res.json({
    name: 'fc-koeln-itp',
    commit: COMMIT,
    node: process.version,
    ts: new Date().toISOString(),
  });
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve React build (ONLY from client/client-dist)
const CLIENT_DIR = path.join(process.cwd(), 'client', 'client-dist');
const hasIndex = fs.existsSync(path.join(CLIENT_DIR, 'index.html'));
console.log('[startup] UI dir:', CLIENT_DIR, hasIndex ? '(index.html found)' : '(missing)');

if (hasIndex) {
  console.log('[startup] Serving client from:', CLIENT_DIR);

  // static with cache headers: cache everything but index.html
  app.use(
    express.static(CLIENT_DIR, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );

  // SPA fallback (don’t intercept API/health)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) return next();
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });
} else {
  console.log('[startup] client build missing — skipping static hosting');
  app.get('/', (_req, res) => res.status(503).send('UI not built'));
}

// 404 for API requests
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: unknown, _req: Request, res: Response) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal error' });
});
// Start server (SAVE the server handle for graceful shutdown)
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log(`[startup] NODE_ENV=${process.env.NODE_ENV ?? 'undefined'} PORT=${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received, closing server…');
  server.close((err) => {
    if (err) {
      console.error('[shutdown] error closing server', err);
      process.exit(1);
    }
    console.log('[shutdown] closed cleanly');
    process.exit(0);
  });
});
