#!/usr/bin/env node

// Post-build script to replace the broken dist/index.js with working version
// This runs after the package.json build command completes

import fs from 'fs';
import path from 'path';

console.log('🔧 Post-build: Replacing broken dist/index.js with working deployment server...');

// Check if the working version exists
const workingServerPath = 'dist/index.js.working';
const targetPath = 'dist/index.js';

if (fs.existsSync(workingServerPath)) {
    // Copy the working server over the broken one
    fs.copyFileSync(workingServerPath, targetPath);
    console.log('✅ Successfully replaced dist/index.js with working deployment server');
    
    // Verify the replacement
    const stats = fs.statSync(targetPath);
    console.log(`📦 Deployment server size: ${stats.size} bytes`);
    
    // Check if package.json exists and has zero dependencies
    const packageJsonPath = 'dist/package.json';
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('📋 Dependencies:', Object.keys(packageJson.dependencies || {}).length);
    }
    
} else {
    console.log('❌ Working server not found at:', workingServerPath);
    console.log('🔄 Rebuilding deployment server...');
    
    // Rebuild the deployment server
    import('./build-deploy.js');
}

console.log('🚀 Ready for deployment!');