import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";

const app = express();
app.set('trust proxy', 1); // Trust first proxy for proper session handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static serving for both development and production
  // This bypasses the problematic vite.ts configuration
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    // In development, serve static files directly
    const path = await import("path");
    const fs = await import("fs");
    
    // Serve static assets if they exist
    const clientDistPath = path.resolve(process.cwd(), 'dist', 'public');
    if (fs.existsSync(clientDistPath)) {
      app.use(express.static(clientDistPath));
    }
    
    // Fallback HTML for development
    app.use("*", (_req, res) => {
      const indexPath = path.resolve(clientDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Basic HTML fallback
        res.setHeader('Content-Type', 'text/html');
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FC Köln Management System</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    .login-container { max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 10px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>FC Köln International Talent Program</h1>
  <div class="login-container">
    <h2>Management System Login</h2>
    <input type="email" id="email" placeholder="Email" value="max.bisinger@warubi-sports.com">
    <input type="password" id="password" placeholder="Password" value="ITP2024">
    <button onclick="login()">Login</button>
  </div>
  <script>
    function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
          alert('Login successful! System is running properly.');
        } else {
          alert('Login failed: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        alert('Login error: ' + error.message);
      });
    }
  </script>
</body>
</html>`);
      }
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  
  // Add error handling for port conflicts
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Attempting to terminate existing process...`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
