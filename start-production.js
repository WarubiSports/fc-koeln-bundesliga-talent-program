#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Management System (Production Mode)');

// Stop any existing servers
const killProcess = spawn('pkill', ['-f', 'tsx server/index.ts'], { stdio: 'inherit' });

killProcess.on('close', () => {
  // Start the working production server
  console.log('🔥 Starting production server...');
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000' }
  });
  
  serverProcess.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
});