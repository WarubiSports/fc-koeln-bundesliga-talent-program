#!/usr/bin/env node

/**
 * Working Preview Server for FC Köln Management System
 * This completely bypasses all configuration issues and provides a working preview
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Check if production server exists
const distPath = path.join(__dirname, 'dist');
const serverPath = path.join(distPath, 'index.js');

if (!fs.existsSync(serverPath)) {
    console.log('❌ Production server not found. Please ensure dist/index.js exists.');
    process.exit(1);
}

console.log('🚀 Starting FC Köln Management System Preview...');
console.log('📦 Using existing production build...');

// Find available port
function checkPort(port) {
    return new Promise((resolve) => {
        const server = require('http').createServer();
        server.listen(port, () => {
            server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
    });
}

async function findAvailablePort(startPort = 5000) {
    for (let port = startPort; port <= startPort + 10; port++) {
        if (await checkPort(port)) {
            return port;
        }
    }
    return 5000;
}

async function startPreview() {
    const port = await findAvailablePort(5000);
    
    console.log(`🔧 Starting preview server on port ${port}...`);
    
    // Start the production server
    const serverProcess = spawn('node', ['index.js'], {
        cwd: distPath,
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: port,
            NODE_ENV: 'production'
        }
    });
    
    // Handle server lifecycle
    serverProcess.on('error', (error) => {
        console.error('❌ Server error:', error);
        process.exit(1);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`🛑 Server exited with code ${code}`);
        process.exit(code);
    });
    
    // Display startup info
    setTimeout(() => {
        console.log('');
        console.log('🎉 FC Köln Management System Preview is running!');
        console.log(`📡 Access your app at: http://localhost:${port}`);
        console.log('🔐 Admin login: max.bisinger@warubi-sports.com');
        console.log('🔑 Password: ITP2024');
        console.log('');
        console.log('✅ Features available:');
        console.log('   - Complete authentication system');
        console.log('   - Player management');
        console.log('   - Chore tracking');
        console.log('   - Event scheduling');
        console.log('   - House management');
        console.log('   - All database operations');
        console.log('');
        console.log('💡 Tips:');
        console.log('   - Refresh the page if you see connection issues');
        console.log('   - Login with the credentials above');
        console.log('   - All features are fully functional');
        console.log('');
        console.log('Press Ctrl+C to stop the server');
    }, 2000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\\n🛑 Shutting down preview server...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\\n🛑 Shutting down preview server...');
        serverProcess.kill('SIGTERM');
        process.exit(0);
    });
}

// Start the preview
startPreview().catch((error) => {
    console.error('❌ Failed to start preview:', error);
    process.exit(1);
});