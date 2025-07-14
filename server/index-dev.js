const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { fileURLToPath } = require('url');

console.log('🚀 Starting FC Köln Development Server (CommonJS)...');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../dist/public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple token-based authentication
const tokens = new Map();

function createUserToken(userData) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  tokens.set(token, {
    ...userData,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  return token;
}

function getUserFromToken(token) {
  const userData = tokens.get(token);
  if (!userData) return null;
  
  if (userData.expiresAt < new Date()) {
    tokens.delete(token);
    return null;
  }
  
  return userData;
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = {
      id: 1,
      email: 'max.bisinger@warubi-sports.com',
      name: 'Max Bisinger',
      role: 'admin'
    };
    
    const token = createUserToken(user);
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
}

// Protected routes
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/api/players', requireAuth, (req, res) => {
  res.json([
    { id: 1, name: 'Max Bisinger', position: 'Coach', house: 'Widdersdorf 1', status: 'active' },
    { id: 2, name: 'Test Player', position: 'Forward', house: 'Widdersdorf 2', status: 'active' }
  ]);
});

app.get('/api/chores', requireAuth, (req, res) => {
  res.json([
    { id: 1, title: 'Clean Kitchen', assignedTo: 'Max Bisinger', dueDate: '2025-07-15', status: 'pending' },
    { id: 2, title: 'Vacuum Living Room', assignedTo: 'Test Player', dueDate: '2025-07-16', status: 'pending' }
  ]);
});

app.get('/api/events', requireAuth, (req, res) => {
  res.json([
    { id: 1, title: 'Team Practice', date: '2025-07-15', time: '09:00', type: 'practice' },
    { id: 2, title: 'Weight Lifting', date: '2025-07-16', time: '14:00', type: 'training' }
  ]);
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/public/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`FC Köln Management System listening on port ${PORT}`);
  console.log(`Admin account available: max.bisinger@warubi-sports.com`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Access the app at: http://localhost:${PORT}`);
});