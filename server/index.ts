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
        // Enhanced fallback with CSS variables for the React app
        res.setHeader('Content-Type', 'text/html');
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1">
  <meta name="theme-color" content="#DC143C">
  <title>FC Köln Management System</title>
  <style>
    :root {
      --background: 0 0% 100%;
      --foreground: 224 71% 4%;
      --card: 0 0% 100%;
      --card-foreground: 224 71% 4%;
      --popover: 0 0% 100%;
      --popover-foreground: 224 71% 4%;
      --primary: 224 71% 4%;
      --primary-foreground: 210 20% 98%;
      --secondary: 220 14% 96%;
      --secondary-foreground: 220 9% 46%;
      --muted: 220 14% 96%;
      --muted-foreground: 220 9% 46%;
      --accent: 220 14% 96%;
      --accent-foreground: 220 9% 46%;
      --destructive: 0 84% 60%;
      --destructive-foreground: 210 20% 98%;
      --border: 220 13% 91%;
      --input: 220 13% 91%;
      --ring: 224 71% 4%;
      --radius: 0.5rem;
    }
    .dark {
      --background: 224 71% 4%;
      --foreground: 210 20% 98%;
      --card: 224 71% 4%;
      --card-foreground: 210 20% 98%;
      --popover: 224 71% 4%;
      --popover-foreground: 210 20% 98%;
      --primary: 210 20% 98%;
      --primary-foreground: 220 9% 46%;
      --secondary: 215 28% 17%;
      --secondary-foreground: 210 20% 98%;
      --muted: 215 28% 17%;
      --muted-foreground: 217 11% 65%;
      --accent: 215 28% 17%;
      --accent-foreground: 210 20% 98%;
      --destructive: 0 63% 31%;
      --destructive-foreground: 210 20% 98%;
      --border: 215 28% 17%;
      --input: 215 28% 17%;
      --ring: 216 12% 84%;
    }
    * {
      border-color: hsl(var(--border));
    }
    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: ui-sans-serif, system-ui, sans-serif;
      margin: 0;
      padding: 20px;
    }
    #root {
      min-height: 100vh;
      width: 100%;
    }
    .fallback-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      background: hsl(var(--card));
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid hsl(var(--border));
      border-radius: 4px;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    button {
      width: 100%;
      padding: 10px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="fallback-container">
      <h1>FC Köln International Talent Program</h1>
      <h2>Management System</h2>
      <p>Loading React application...</p>
      <div id="loading-test">
        <input type="email" id="email" placeholder="Email" value="max.bisinger@warubi-sports.com">
        <input type="password" id="password" placeholder="Password" value="ITP2024">
        <button onclick="testLogin()">Test Authentication</button>
      </div>
    </div>
  </div>
  <script>
    function testLogin() {
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
          alert('✓ Authentication working! Token: ' + data.token.substring(0, 20) + '...');
        } else {
          alert('✗ Login failed: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        alert('✗ Login error: ' + error.message);
      });
    }
    
    // Try to load the production React app
    setTimeout(() => {
      const script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = true;
      script.src = '/assets/index-D9rQIHwU.js';
      script.onload = () => console.log('React app loaded');
      script.onerror = () => console.log('React app failed to load');
      document.head.appendChild(script);
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = true;
      link.href = '/assets/index-DFRn-7AA.css';
      document.head.appendChild(link);
    }, 100);
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
