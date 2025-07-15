#!/usr/bin/env node

/**
 * Working Production Build Script
 * This script creates a deployment using the actual working server code
 * with all database functionality and role update fixes included
 */

const { execSync } = require('child_process');
const { mkdirSync, existsSync, writeFileSync, rmSync } = require('fs');
const path = require('path');

function createWorkingDeployment() {
  console.log('🔧 Creating deployment build with working server...');
  
  // Clean dist directory
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  mkdirSync('dist', { recursive: true });
  mkdirSync('dist/public', { recursive: true });
  
  // Use esbuild to bundle the real server with all dependencies
  console.log('📦 Bundling server with esbuild...');
  try {
    execSync(`npx esbuild server/index.ts --bundle --platform=node --target=node20 --format=cjs --outfile=dist/index.js --external:pg-native`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ Server bundling failed:', error.message);
    process.exit(1);
  }
  
  // Create deployment package.json WITHOUT "type": "module" 
  const productionPackageJson = {
    name: 'fc-koln-management',
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    engines: {
      node: '>=20.0.0'
    }
  };
  
  writeFileSync('dist/package.json', JSON.stringify(productionPackageJson, null, 2));
  
  // Build frontend
  console.log('🎨 Building frontend...');
  try {
    execSync('npx vite build --outDir dist/public', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Working deployment build completed successfully!');
  console.log('📦 Build Output:');
  console.log('   - dist/index.js (Bundled server with database)');
  console.log('   - dist/package.json (CommonJS config)');
  console.log('   - dist/public/ (Production frontend)');
  
  console.log('🚀 Ready for deployment!');
}

if (require.main === module) {
  createWorkingDeployment();
}

module.exports = createWorkingDeployment;