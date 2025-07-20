#!/usr/bin/env node
// Startup script for FC Köln Management System
console.log('🚀 Starting FC Köln Management System...');

// Kill any existing processes
const { execSync } = require('child_process');
try {
  execSync('killall -SIGTERM tsx node 2>/dev/null', { stdio: 'ignore' });
} catch (e) {
  // Ignore errors - processes may not exist
}

// Start the complete production server
require('./dist/index.js');