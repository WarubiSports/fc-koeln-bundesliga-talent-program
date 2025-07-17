#!/usr/bin/env node

// Simple development server that bypasses the broken vite.config.ts
// This allows normal development while keeping deployment functionality

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Management System in development mode...');
console.log('📝 Bypassing vite.config.ts issue for immediate functionality');

// Start the working server directly
const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGTERM');
});