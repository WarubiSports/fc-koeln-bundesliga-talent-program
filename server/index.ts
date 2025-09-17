import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';

const app = express();

// 🟢 Step 1: Health endpoints FIRST
app.get('/healthz', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get('/healthz/ready', (_req, res) => {
  res.send('OK');
});

// Middlewares (security, JSON parser, etc.)
app.use(helmet());
app.use(cors());
app.use(express.json());

// 🟢 Step 2: Serve client only if the folder exists
const CLIENT_DIR = path.join(process.cwd(), 'client-dist');

if (fs.existsSync(CLIENT_DIR)) {
  console.log('[startup] Serving client from:', CLIENT_DIR);

  app.use(express.static(CLIENT_DIR));

  // Catch-all: send index.html for non-API, non-health routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/healthz')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
  });
} else {
  console.log('[startup] client-dist not found — skipping static hosting');
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});