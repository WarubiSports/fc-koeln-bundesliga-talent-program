#!/usr/bin/env node

// Development server wrapper for FC Köln app
// Forces port 3000 for Replit workflow compatibility
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting FC Köln Development Server on port 3000...');
console.log('📍 This is the development version for Replit');
console.log('🏗️  Production builds will use the configured port for Railway');

// Import and run the FC Köln app using spawn to handle module differences
const { spawn } = require('child_process');

const fcKolnProcess = spawn('node', ['fc-koln-stable-permanent.cjs'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000', NODE_ENV: 'development' }
});

fcKolnProcess.on('close', (code) => {
  console.log(`FC Köln app exited with code ${code}`);
  process.exit(code);
});