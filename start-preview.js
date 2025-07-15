#!/usr/bin/env node

/**
 * Preview Server for FC Köln Management System
 * Uses the existing production build to enable preview functionality
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FC Köln Management System Preview...');

// First, ensure we have a production build
console.log('📦 Building production version...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    
    // Start the production server for preview
    console.log('🔧 Starting preview server...');
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000
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
    
  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(1);
  }
});

buildProcess.on('error', (err) => {
  console.error('Build error:', err);
  process.exit(1);
});