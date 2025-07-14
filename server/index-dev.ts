import express from 'express';
import { simpleAuth, simpleAdminAuth, simpleAdminOrCoachAuth } from './auth-simple.js';
import { storage } from './storage.js';
import { registerRoutes } from './routes.js';
import { createServer } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../dist/public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize storage
console.log('Initializing database storage...');
try {
  await storage.getAllUsers();
  console.log('Database storage initialized successfully');
} catch (error) {
  console.error('Database initialization failed:', error);
}

// Register API routes
await registerRoutes(app);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/public/index.html'));
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`FC Köln Management System listening on port ${PORT}`);
  console.log(`Admin account available: max.bisinger@warubi-sports.com`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});