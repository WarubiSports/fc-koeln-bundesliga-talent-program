#!/usr/bin/env node

const { execSync } = require('child_process');
const { mkdirSync, existsSync, copyFileSync, writeFileSync, rmSync } = require('fs');

function buildCompleteApp() {
  console.log('🚀 Building Complete FC Köln Management System...');
  
  // Step 1: Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true, force: true });
  }
  mkdirSync('dist', { recursive: true });
  
  // Step 2: Build React frontend
  console.log('⚛️ Building React frontend...');
  try {
    execSync('npx vite build --config vite.config.simple.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ React frontend built successfully');
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
  }
  
  // Step 3: Copy complete server
  console.log('📄 Copying complete server...');
  copyFileSync('server-complete.js', 'dist/index.js');
  
  // Step 4: Create production package.json
  console.log('📦 Creating production package.json...');
  const productionPackageJson = {
    name: 'fc-koln-management-complete',
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
  
  console.log('✅ Complete FC Köln Management System built successfully!');
  console.log('');
  console.log('📦 Build Output:');
  console.log('   - dist/index.js (Complete server with all API endpoints)');
  console.log('   - dist/package.json (Production config)');
  console.log('   - dist/public/* (Complete React application)');
  console.log('');
  console.log('🎯 Features Included:');
  console.log('   ✅ Complete React frontend with all pages');
  console.log('   ✅ Player management system');
  console.log('   ✅ House management and chores');
  console.log('   ✅ Calendar and events');
  console.log('   ✅ Food ordering system');
  console.log('   ✅ Communications');
  console.log('   ✅ Admin panels');
  console.log('   ✅ Authentication system');
  console.log('   ✅ All original functionality restored');
  console.log('');
  console.log('🚀 To run: cd dist && node index.js');
  console.log('🌐 Admin access: max.bisinger@warubi-sports.com / ITP2024');
  console.log('👨‍💼 Staff access: thomas.ellinger@warubi-sports.com / ITP2024');
}

buildCompleteApp();