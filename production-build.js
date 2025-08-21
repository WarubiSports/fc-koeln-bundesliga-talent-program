#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating production build for Replit deployment...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy minimal working app for deployment
fs.copyFileSync('dist/minimal-app.js', 'dist/index.js');

console.log('✅ Copied minimal-app.js → dist/index.js (deployment-safe version)');
console.log('📋 Production build configured for Replit deployment environment');

// Create the expected production package.json
const productionPackage = {
    name: "fc-koln-management-production",
    version: "1.0.0",
    main: "index.js",
    scripts: {
        start: "node index.js"
    },
    engines: {
        node: ">=18.0.0"
    },
    dependencies: {
        "express": "^4.21.2"
    }
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));

console.log('✅ Production build completed successfully!');
console.log('📦 Created: dist/index.js');
console.log('📦 Created: dist/package.json');
console.log('🚀 Ready for deployment!');