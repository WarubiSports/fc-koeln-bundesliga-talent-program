// server/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';

const app = express();

// Health first
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});
app.get('/healthz/ready', (_req, res) => {
  res.send('OK');
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
  app.use(express.static(CLIENT_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) return next();
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });
} else {
  console.log('[startup] client build missing — skipping static hosting');
  app.get('/', (_req, res) => res.status(503).send('UI not built'));
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
});
