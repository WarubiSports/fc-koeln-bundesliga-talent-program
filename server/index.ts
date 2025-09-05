import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// serve built client
const clientDist = path.resolve(__dirname, '../client-dist');
app.use(express.static(clientDist));

// SPA fallback
app.get('/*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(port, () => {
  console.log(`[startup] Serving client from: ${clientDist}`);
  console.log(`🚀 Server running on port ${port}`);
});
