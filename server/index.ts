import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// serve built client (from dist/ to client-dist/)
const clientDist = path.resolve(__dirname, '../client-dist');
app.use(express.static(clientDist));

// SPA fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
