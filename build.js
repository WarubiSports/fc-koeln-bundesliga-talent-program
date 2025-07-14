#!/usr/bin/env node

// Custom build script to replace the broken package.json build command
// This will be called by the deployment system

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('🔨 Building FC Köln Management System...');
  
  try {
    // Step 1: Build frontend
    console.log('1. Building frontend...');
    await runCommand('npm', ['run', 'build:frontend']);
    
    // Step 2: Create deployment server
    console.log('2. Creating deployment server...');
    
    // Read the deployment script
    const deployScript = fs.readFileSync('build-deploy.js', 'utf8');
    
    // Execute the deployment build logic
    const buildDeployCode = deployScript.replace('#!/usr/bin/env node', '');
    eval(buildDeployCode);
    
    console.log('✅ Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();