// CommonJS-compatible development server that preserves all FC Köln functionality
const express = require("express");
const { createServer } = require("http");
const path = require("path");
const fs = require("fs");

// Import the compiled routes and other modules
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
    }
  });

  next();
});

// Start the server setup
(async () => {
  // We need to compile and import the TypeScript routes
  try {
    // Use tsx to run the routes registration
    const { spawn } = require('child_process');
    
    // Create a temporary server setup script
    const serverSetupScript = `
const express = require('express');
const { createServer } = require('http');

// Import the TypeScript modules using tsx
const { registerRoutes } = require('./server/routes.ts');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Start the server
(async () => {
  const server = await registerRoutes(app);
  
  // Serve static files for production-like development
  const clientPath = path.join(__dirname, 'client/dist');
  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
  } else {
    // Simple fallback for development
    app.get('*', (req, res) => {
      res.send(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>FC Köln Management System</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { color: green; margin: 10px 0; }
            .error { color: red; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>FC Köln Management System</h1>
            <p class="status">Server is running on port 5000</p>
            <p>API endpoints are available at /api/*</p>
            <p>Build the client to see the full application</p>
          </div>
        </body>
        </html>
      \`);
    });
  }
  
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(\`\${new Date().toLocaleTimeString()} [express] FC Köln Management System serving on port \${port}\`);
  });
})();
`;
    
    // Since we can't directly run TypeScript in CommonJS, let's create a bridge
    const { exec } = require('child_process');
    
    console.log("Starting FC Köln Management System in development mode...");
    
    // Use tsx to run the server
    const serverProcess = spawn('npx', ['tsx', '--', '-e', serverSetupScript], {
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down FC Köln Management System...');
      serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('Shutting down FC Köln Management System...');
      serverProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();