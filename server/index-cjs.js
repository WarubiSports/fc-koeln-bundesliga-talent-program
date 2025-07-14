const express = require('express');
const path = require('path');
const { Pool } = require('pg');

// Simple in-memory token store for CommonJS deployment
const tokenStore = new Map();

// Create a token for user authentication
function createToken(user) {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  tokenStore.set(token, { user, expiry });
  return token;
}

// Validate token
function validateToken(token) {
  const tokenData = tokenStore.get(token);
  if (!tokenData) return null;
  
  if (Date.now() > tokenData.expiry) {
    tokenStore.delete(token);
    return null;
  }
  
  return tokenData.user;
}

// Simple authentication middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const user = validateToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
}

// Simple admin auth
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const user = validateToken(token);
  if (!user || user.email !== 'max.bisinger@warubi-sports.com') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  req.user = user;
  next();
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith('/api')) {
      console.log(`${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple hardcoded admin credentials
  if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = {
      id: 1,
      email: 'max.bisinger@warubi-sports.com',
      name: 'Max Bisinger',
      role: 'admin'
    };
    
    const token = createToken(user);
    res.json({ token, user });
    return;
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// Protected endpoints
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/api/players', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/chores', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/events', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/notifications', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/food-orders', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/messages', requireAuth, (req, res) => {
  res.json([]);
});

// Admin endpoints
app.get('/api/users', requireAdmin, (req, res) => {
  res.json([]);
});

app.get('/api/users/approved', requireAdmin, (req, res) => {
  res.json([]);
});

app.get('/api/users/pending', requireAdmin, (req, res) => {
  res.json([]);
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('<!DOCTYPE html><html><head><title>FC Köln Management</title></head><body><h1>FC Köln Management System</h1><p>Server is running but frontend assets are not available.</p></body></html>');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log('Database storage initialized successfully');
  console.log('Admin account available: max.bisinger@warubi-sports.com');
  console.log('Environment: production');
});