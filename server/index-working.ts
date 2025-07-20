import express from "express";
import { createServer } from "http";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const app = express();
const server = createServer(app);

// Import storage and authentication
import { getDbStorage } from "./storage";
import { setupAuth } from "./auth-simple";

// Middleware
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Setup authentication and storage
const storage = getDbStorage();
setupAuth(app, storage);

// Import and setup all API routes
const setupRoutes = require("./routes").default;
setupRoutes(app, storage);

// Serve client files in development
if (process.env.NODE_ENV !== 'production') {
  // In development, serve the React dev build or static files
  const clientPublicPath = join(process.cwd(), 'client', 'public');
  const clientIndexPath = join(process.cwd(), 'client', 'index.html');
  
  if (existsSync(clientPublicPath)) {
    app.use('/assets', express.static(join(clientPublicPath, 'assets')));
  }
  
  // Serve index.html for all non-API routes in development
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    
    try {
      if (existsSync(clientIndexPath)) {
        const html = readFileSync(clientIndexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // Fallback HTML for development
        res.setHeader('Content-Type', 'text/html');
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FC Köln Management System</title>
  <script type="module" src="/src/main.tsx"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`);
      }
    } catch (error) {
      console.error('Error serving client:', error);
      res.status(500).json({ error: 'Failed to serve client application' });
    }
  });
} else {
  // In production, serve built files
  const distPath = join(process.cwd(), 'dist', 'public');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// Error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`FC Köln Management System running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize storage
  try {
    await storage.initialize?.();
    console.log('Database storage initialized successfully');
    console.log('Admin account available: max.bisinger@warubi-sports');
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);