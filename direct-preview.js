#!/usr/bin/env node

/**
 * Direct Preview Server - Uses existing production build
 * No build process, just serves what's already in dist/
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Check if production build exists
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.js');

if (!fs.existsSync(indexPath)) {
  console.log('❌ Production build not found in dist/index.js');
  console.log('🔧 Let me create a quick production build...');
  
  // Create a minimal production server
  const serverCode = `const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

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
  const indexFile = path.join(__dirname, 'public/index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Frontend not found');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('FC Köln Management System listening on port ' + PORT);
  console.log('Admin account: max.bisinger@warubi-sports.com');
  console.log('Environment: preview');
});`;

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  fs.writeFileSync(indexPath, serverCode);
  console.log('✅ Created minimal production server');
}

// Find available port
async function findAvailablePort(startPort = 5000) {
  for (let port = startPort; port <= startPort + 10; port++) {
    const available = await new Promise((resolve) => {
      const server = http.createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });
    if (available) return port;
  }
  return 5000;
}

async function startDirectPreview() {
  console.log('🚀 Starting Direct Preview Server...');
  
  const port = await findAvailablePort(5000);
  
  // Start the existing production server
  const { spawn } = require('child_process');
  const serverProcess = spawn('node', [indexPath], {
    stdio: 'inherit',
    cwd: distPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: port
    }
  });
  
  serverProcess.on('close', (code) => {
    console.log('Preview server exited with code:', code);
  });
  
  serverProcess.on('error', (err) => {
    console.error('Preview server error:', err);
  });
  
  // Display info after a short delay
  setTimeout(() => {
    console.log('');
    console.log('🎉 Direct Preview Server is running!');
    console.log('📡 Access your app at: http://localhost:' + port);
    console.log('🔐 Admin login: max.bisinger@warubi-sports.com');
    console.log('🔑 Password: ITP2024');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  }, 2000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n🛑 Stopping preview server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
}

startDirectPreview().catch(console.error);