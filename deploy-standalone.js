#!/usr/bin/env node

// Standalone deployment script that bypasses all workflow issues
// This creates a completely independent deployment ready for Replit

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating standalone deployment...');

// Ensure we have the working server
if (!fs.existsSync('index.js')) {
  console.error('❌ index.js not found. Run npm run build first.');
  process.exit(1);
}

// Create a minimal deployment structure
const deploymentDir = 'deployment';
if (fs.existsSync(deploymentDir)) {
  fs.rmSync(deploymentDir, { recursive: true, force: true });
}
fs.mkdirSync(deploymentDir, { recursive: true });

// Copy the working server
fs.copyFileSync('index.js', path.join(deploymentDir, 'index.js'));

// Create a minimal package.json for deployment
const deploymentPackage = {
  name: "fc-koln-management-deployment",
  version: "1.0.0",
  main: "index.js",
  scripts: {
    start: "node index.js"
  },
  engines: {
    node: ">=20.0.0"
  }
};

fs.writeFileSync(
  path.join(deploymentDir, 'package.json'), 
  JSON.stringify(deploymentPackage, null, 2)
);

// Create a simple .replit file for deployment
const replitConfig = `modules = ["nodejs-20", "web", "postgresql-16"]
run = "node index.js"

[deployment]
deploymentTarget = "autoscale"
build = []
run = ["node", "index.js"]

[[ports]]
localPort = 5000
externalPort = 80
`;

fs.writeFileSync(path.join(deploymentDir, '.replit'), replitConfig);

console.log('✅ Standalone deployment created in ./deployment/');
console.log('📁 Files created:');
console.log('   - deployment/index.js (Complete server)');
console.log('   - deployment/package.json (Minimal config)');
console.log('   - deployment/.replit (Direct deployment config)');

console.log('\n🔧 Deployment instructions:');
console.log('1. Copy the contents of ./deployment/ to a new Replit project');
console.log('2. Click Deploy - it will start index.js directly');
console.log('3. Thomas credentials: thomas.ellinger@warubi-sports.com / ITP2024');

console.log('\n✅ This deployment bypasses all workflow issues completely!');