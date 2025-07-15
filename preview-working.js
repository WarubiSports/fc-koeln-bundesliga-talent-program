#!/usr/bin/env node

/**
 * Working Preview Server for FC Köln Management System
 * Provides a functional preview that bypasses all configuration issues
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting FC Köln Management System Preview...');

// Function to check if port is available
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

// Function to find available port
async function findAvailablePort(startPort = 5000) {
  for (let port = startPort; port <= startPort + 10; port++) {
    if (await checkPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No available ports found');
}

async function startPreview() {
  try {
    console.log('📦 Building production version...');
    
    // Build the production version
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    buildProcess.on('close', async (code) => {
      if (code === 0) {
        console.log('✅ Build completed successfully!');
        
        // Find an available port
        const availablePort = await findAvailablePort(5000);
        console.log(`🔧 Starting preview server on port ${availablePort}...`);
        
        // Start the production server
        const serverProcess = spawn('node', ['dist/index.js'], {
          stdio: 'inherit',
          cwd: process.cwd(),
          env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: availablePort
          }
        });
        
        serverProcess.on('close', (serverCode) => {
          console.log(`Preview server exited with code ${serverCode}`);
        });
        
        serverProcess.on('error', (err) => {
          console.error('Preview server error:', err);
        });
        
        // Handle process termination
        process.on('SIGINT', () => {
          console.log('\n🛑 Stopping preview server...');
          serverProcess.kill('SIGINT');
          process.exit(0);
        });
        
        // Display success message
        setTimeout(() => {
          console.log('');
          console.log('🎉 Preview server is running!');
          console.log(`📡 Access your app at: http://localhost:${availablePort}`);
          console.log('🔐 Admin login: max.bisinger@warubi-sports.com');
          console.log('🔑 Password: ITP2024');
          console.log('');
          console.log('Press Ctrl+C to stop the server');
        }, 2000);
        
      } else {
        console.error('❌ Build failed with code:', code);
        process.exit(1);
      }
    });
    
    buildProcess.on('error', (err) => {
      console.error('Build error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Error starting preview:', error);
    process.exit(1);
  }
}

startPreview();