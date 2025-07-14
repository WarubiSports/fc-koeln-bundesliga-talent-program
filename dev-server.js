#!/usr/bin/env node

/**
 * Development Server Script
 * This script bypasses the vite.config.ts top-level await issue
 * by directly starting the server and vite dev server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Development Server...');
console.log('');

// Start the backend server
const backend = spawn('node', ['-r', 'tsx/cjs', 'server/index-dev.ts'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start the frontend dev server with custom config
const frontend = spawn('npx', ['vite', 'client', '--config', 'vite.config.dev.ts'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle backend output
backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Handle frontend output
frontend.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  frontend.kill('SIGTERM');
});

frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  backend.kill('SIGTERM');
});

console.log('✅ Development server started!');
console.log('   - Backend: http://localhost:5000');
console.log('   - Frontend: http://localhost:5173');
console.log('   - Press Ctrl+C to stop');
console.log('');