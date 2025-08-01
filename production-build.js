#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating production build...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy our working fc-koln-7300-working.js to the expected production location
fs.copyFileSync('fc-koln-7300-working.js', 'dist/index.js');

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
    dependencies: {}
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));

console.log('✅ Production build completed successfully!');
console.log('📦 Created: dist/index.js');
console.log('📦 Created: dist/package.json');
console.log('🚀 Ready for deployment!');