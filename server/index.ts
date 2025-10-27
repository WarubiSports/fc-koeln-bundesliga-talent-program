import 'dotenv/config';
import express from 'express';

const app = express();

// Parse JSON just in case
app.use(express.json());

// Health endpoints
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/healthz/ready', (_req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Ping
app.get('/v1/ping', (_req, res) => {
  res.status(200).json({ pong: true, ts: new Date().toISOString() });
});

// Root (optional)
app.get('/', (_req, res) => {
  res.status(200).json({ name: 'workspace', status: 'running' });
});

// Bind port
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
