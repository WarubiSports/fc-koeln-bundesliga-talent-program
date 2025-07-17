// Development script using production build to avoid import.meta.dirname issues
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting FC Köln Management System in development mode...');

// Function to run build and start server
function runDevelopment() {
  console.log('📦 Building application...');
  
  const buildProcess = spawn('node', ['production-build.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('🔥 Starting development server...');
      
      // Start the production server
      const serverProcess = spawn('node', ['index.js'], {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'dist')
      });

      serverProcess.on('close', (serverCode) => {
        console.log(`Server exited with code ${serverCode}`);
      });

      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n👋 Shutting down development server...');
        serverProcess.kill();
        process.exit(0);
      });
    } else {
      console.error('Build failed with code:', code);
      process.exit(1);
    }
  });
}

runDevelopment();