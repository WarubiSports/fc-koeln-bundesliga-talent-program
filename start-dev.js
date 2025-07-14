#!/usr/bin/env node

/**
 * Simple Development Server Starter
 * This bypasses the vite.config.ts issue by using a working development server
 */

const { spawn } = require('child_process');

console.log('🚀 Starting FC Köln Development Server (Alternative)...');

// Use the working development server directly
const server = spawn('node', ['-r', 'tsx/cjs', 'server/index-dev.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development', PORT: '5000' }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});