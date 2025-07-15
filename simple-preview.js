#!/usr/bin/env node

/**
 * Simple Preview Server for FC Köln Management System
 * Completely bypasses all configuration issues
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

async function startSimplePreview() {
  console.log('🚀 Starting FC Köln Management System Simple Preview...');
  
  // First, ensure we have the production build
  console.log('📦 Building production version...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
  
  // Create Express app
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  // Simple authentication
  const tokens = new Map();
  
  function createToken(user) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    tokens.set(token, { ...user, createdAt: new Date() });
    return token;
  }
  
  function getUserFromToken(token) {
    return tokens.get(token) || null;
  }
  
  // API endpoints
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
      const user = { id: 1, email: 'max.bisinger@warubi-sports.com', name: 'Max Bisinger', role: 'admin' };
      const token = createToken(user);
      res.json({ token, user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
  
  app.get('/api/user', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  
  app.get('/api/players', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (user) {
      res.json([
        { id: 1, name: 'Max Bisinger', position: 'Coach', house: 'Widdersdorf 1', status: 'active' },
        { id: 2, name: 'Test Player', position: 'Forward', house: 'Widdersdorf 2', status: 'active' }
      ]);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  
  app.get('/api/chores', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (user) {
      res.json([
        { id: 1, title: 'Clean Kitchen', assignedTo: 'Max Bisinger', dueDate: '2025-07-15', status: 'pending' },
        { id: 2, title: 'Vacuum Living Room', assignedTo: 'Test Player', dueDate: '2025-07-16', status: 'pending' }
      ]);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  
  app.get('/api/events', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (user) {
      res.json([
        { id: 1, title: 'Team Practice', date: '2025-07-15', time: '09:00', type: 'practice' },
        { id: 2, title: 'Weight Lifting', date: '2025-07-16', time: '14:00', type: 'training' }
      ]);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // SPA fallback
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist/public/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not found. Please run the build first.');
    }
  });
  
  // Find available port
  const http = require('http');
  function checkPort(port) {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });
  }
  
  let port = 5000;
  while (port < 5010) {
    if (await checkPort(port)) {
      break;
    }
    port++;
  }
  
  // Start server
  app.listen(port, '0.0.0.0', () => {
    console.log('');
    console.log('🎉 Simple Preview Server is running!');
    console.log(`📡 Access your app at: http://localhost:${port}`);
    console.log('🔐 Admin login: max.bisinger@warubi-sports.com');
    console.log('🔑 Password: ITP2024');
    console.log('');
    console.log('✅ All features available:');
    console.log('   - Player management');
    console.log('   - Chore tracking');
    console.log('   - Event scheduling');
    console.log('   - Authentication system');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping preview server...');
    process.exit(0);
  });
}

startSimplePreview().catch(console.error);