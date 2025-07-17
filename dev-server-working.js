// Working development server that bypasses vite.ts issues
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');

console.log('Starting FC Köln Management System...');

// Create Express app
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add request logging
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
      const time = new Date().toLocaleTimeString();
      console.log(`${time} [express] ${logLine}`);
    }
  });

  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error('Error:', err);
});

async function startServer() {
  try {
    // Import and setup routes using tsx
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    // Start the actual server with full TypeScript support
    const serverProcess = require('child_process').spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Handle server process events
    serverProcess.on('error', (error) => {
      console.error('Server error:', error);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(`Server exited with code ${code} and signal ${signal}`);
      if (code !== 0) {
        console.log('Restarting server...');
        setTimeout(() => startServer(), 2000);
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down...');
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('Shutting down...');
      serverProcess.kill('SIGTERM');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();