#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏗️ Building FC Köln Management System for production...');

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

// Copy the comprehensive working application to dist
console.log('📋 Copying comprehensive FC Köln application...');
fs.copyFileSync('fc-koln-7300-working.js', 'dist/index.js');

// Copy static assets
if (fs.existsSync('attached_assets')) {
    console.log('🖼️ Copying static assets...');
    if (!fs.existsSync('dist/attached_assets')) {
        fs.mkdirSync('dist/attached_assets', { recursive: true });
    }
    
    const files = fs.readdirSync('attached_assets');
    files.forEach(file => {
        fs.copyFileSync(
            path.join('attached_assets', file),
            path.join('dist/attached_assets', file)
        );
        console.log(`   ✓ ${file}`);
    });
}

// Create package.json for production
const productionPackage = {
    "name": "fc-koln-management-system",
    "version": "1.0.0",
    "description": "1.FC Köln Bundesliga Talent Program Management System",
    "main": "index.js",
    "scripts": {
        "start": "node index.js"
    },
    "dependencies": {},
    "engines": {
        "node": ">=16.0.0"
    }
};

fs.writeFileSync('dist/package.json', JSON.stringify(productionPackage, null, 2));

console.log('✅ Production build complete - Ready for deployment');
console.log('📁 Built files are in dist/ directory');
console.log('🚀 Application includes complete FC Köln management system');
console.log('📋 Features: Dashboard, Players, Chores, Calendar, Food Orders, Communications, House Management, Admin');
console.log('🔑 Admin credentials: max.bisinger@warubi-sports.com / ITP2024');
console.log('👤 Staff credentials: thomas.ellinger@warubi-sports.com / ITP2024');