#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating production build...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy our working index.js to the expected production location
fs.copyFileSync('index.js', 'dist/index-production.js');

// Create the expected production package.json
const productionPackage = {
    name: "fc-koln-management-production",
    version: "1.0.0",
    main: "index-production.js",
    scripts: {
        start: "node index-production.js"
    },
    engines: {
        node: ">=18.0.0"
    },
    dependencies: {}
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));

console.log('✅ Production build completed successfully!');
console.log('📦 Created: dist/index-production.js');
console.log('📦 Created: dist/package.json');
console.log('🚀 Ready for deployment!');