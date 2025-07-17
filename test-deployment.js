#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Management System deployment test...');
console.log('🔧 This tests the exact deployment build that will be used in production');

// Change to dist directory and run the server
const serverPath = path.join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'dist')
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down deployment test...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down deployment test...');
  server.kill('SIGTERM');
  process.exit(0);
});