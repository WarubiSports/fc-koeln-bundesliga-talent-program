#!/usr/bin/env node
// Complete FC Köln Management System - Production Ready
console.log('🚀 Starting Complete FC Köln Management System...');

// Build the complete system first
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('📦 Building complete system...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('🌟 Starting FC Köln Management System...');
  
  // Start the production server
  process.chdir(path.join(__dirname, 'dist'));
  require('./dist/index.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('🔄 Trying alternative startup...');
  
  // If build fails, try direct production server
  require('./dist/index.js');
}