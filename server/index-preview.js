/**
 * Preview Server for FC Köln Management System
 * This server works around the vite.config.ts top-level await issue
 * to provide a working preview environment
 */

const express = require('express');
const { createServer } = require('vite');
const path = require('path');

async function startPreviewServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    plugins: [
      (await import('@vitejs/plugin-react')).default()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../client/src'),
        '@assets': path.resolve(__dirname, '../client/public'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
  });
  
  // Use vite's connect instance as middleware
  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
  
  // Simple authentication for preview
  const tokens = new Map();
  
  function createToken(user) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    tokens.set(token, { ...user, createdAt: new Date() });
    return token;
  }
  
  function getUserFromToken(token) {
    return tokens.get(token) || null;
  }
  
  // API endpoints for preview
  app.use(express.json());
  
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
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 FC Köln Management System Preview Server');
    console.log(`📡 Server running on port ${PORT}`);
    console.log('🔐 Admin account: max.bisinger@warubi-sports.com');
    console.log('🌐 Environment: preview');
  });
}

startPreviewServer().catch(console.error);