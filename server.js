// Production server entry point for FC Köln Management System
// This file loads the full application for both development and deployment
console.log('🚀 Starting FC Köln Management System...');

// Check if full application exists, otherwise use fallback
const fs = require('fs');
if (fs.existsSync('./fc-koln-stable-permanent.js')) {
    console.log('📍 Loading full FC Köln application with all features...');
    require('./fc-koln-stable-permanent.js');
} else {
    console.log('📍 Fallback: Loading deployment server...');
    require('./deployment-server.js');
}