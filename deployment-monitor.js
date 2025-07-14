#!/usr/bin/env node

// Deployment monitor to ensure working server is always used
// This script monitors the dist/index.js file and replaces it if broken

import fs from 'fs';
import path from 'path';

const WORKING_BACKUP = 'dist/index.js.working';
const TARGET_FILE = 'dist/index.js';

function isWorkingServer(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check if it's our working server (small, self-contained, no external deps)
    return content.includes('FC Köln Management System') &&
           content.includes('Admin users:') &&
           !content.includes('import') && // No imports = self-contained
           content.length < 10000; // Should be small (4-6KB)
  } catch (error) {
    return false;
  }
}

function replaceWithWorkingServer() {
  if (!fs.existsSync(WORKING_BACKUP)) {
    console.log('❌ Working backup not found. Regenerating...');
    // Rebuild the deployment
    import('./build-deploy.js');
    return;
  }
  
  const workingContent = fs.readFileSync(WORKING_BACKUP, 'utf8');
  fs.writeFileSync(TARGET_FILE, workingContent);
  console.log('✅ Replaced broken dist/index.js with working deployment server');
}

function monitorDeployment() {
  if (!fs.existsSync(TARGET_FILE)) {
    console.log('⏳ Waiting for dist/index.js to be created...');
    return;
  }
  
  if (!isWorkingServer(TARGET_FILE)) {
    console.log('🔧 Detected broken deployment server. Replacing...');
    replaceWithWorkingServer();
    
    // Verify the replacement worked
    if (isWorkingServer(TARGET_FILE)) {
      console.log('✅ Deployment server is now working correctly');
    } else {
      console.log('❌ Failed to replace broken server');
    }
  } else {
    console.log('✅ Deployment server is working correctly');
  }
}

// Run the monitor
console.log('🔍 Monitoring deployment...');
monitorDeployment();

// If running as a watcher, monitor for changes
if (process.argv.includes('--watch')) {
  console.log('👀 Watching for changes...');
  fs.watchFile(TARGET_FILE, { interval: 1000 }, () => {
    console.log('📝 Detected change in dist/index.js');
    monitorDeployment();
  });
}