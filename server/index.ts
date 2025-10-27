// server/index.ts
import express from 'express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';

// ⬇️ NEW: multi-app bits
import { attachAppContext } from './middleware/appContext';
import { corsPerApp } from './middleware/corsPerApp';
import { verifyUserJwt } from './auth/jwt';

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

// Middlewares (global)
app.use(helmet());
app.use(express.json());

// ⬇️ NEW: /v1 API with multi-app middleware
const v1 = express.Router();

// attach per-app context (single-app mode works if MULTIAPP_STRICT=false)
v1.use(attachAppContext);

// apply dynamic CORS based on the current app’s allowed origins
v1.use(corsPerApp);

// example public endpoint
v1.get('/ping', (req, res) => {
  res.json({ ok: true, app: req.appCtx?.id });
});

// example protected endpoint (requires Bearer token; enforces audience if strict)
v1.get('/secure-example', (req, res) => {
  const token = req.header('authorization')?.replace(/^bearer\s+/i, '');
  if (!token || !req.appCtx) return res.status(401).json({ error: 'Missing token' });
  try {
    verifyUserJwt(token, req.appCtx.id);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ secret: '42', app: req.appCtx.id });
});

app.use('/v1', v1);

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

  // SPA fallback (don’t intercept API/health/version)
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/v1') ||
      req.path.startsWith('/healthz') ||
      req.path.startsWith('/version')
    ) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });
} else {
  console.log('[startup] client build missing — skipping static hosting');
  app.get('/', (_req, res) => res.status(503).send('UI not built'));
}

// 404 for API requests
app.use('/v1', (_req, res) => res.status(404).json({ error: 'Not found' }));
// (optional legacy) keep /api 404 if anything still points there
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
