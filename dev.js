#!/usr/bin/env node
/**
 * FC Köln Development Server
 * This script starts the working development server
 * bypassing the broken vite.config.ts issue
 */

const { spawn } = require('child_process');

console.log('🚀 Starting FC Köln Management System...');

// Start the working development server
const server = spawn('node', ['server/index-dev.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.log(`Server exited with code ${code}`);
  }
  process.exit(code);
});