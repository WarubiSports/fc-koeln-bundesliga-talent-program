#!/usr/bin/env node

// Simple development server starter that works around import.meta.dirname issue
const { spawn } = require('child_process');
const path = require('path');

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Starting FC Köln Management System in development mode...');

// Start the server with proper flags
const serverProcess = spawn('node', [
  '--experimental-import-meta-resolve',
  '--loader', 'tsx/esm',
  'server/index.ts'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down server...');
  serverProcess.kill('SIGTERM');
});