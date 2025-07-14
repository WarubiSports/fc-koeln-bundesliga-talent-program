import { writeFileSync, mkdirSync, existsSync } from 'fs';

async function buildSimpleDeployment() {
  console.log('Creating simple CommonJS deployment...');
  
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Create a simple, self-contained CommonJS server
  const serverCode = `const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple authentication storage (in-memory for deployment)
const tokens = new Map();
const users = new Map();

// Add default admin user
users.set('max.bisinger@warubi-sports.com', {
  id: '1',
  email: 'max.bisinger@warubi-sports.com',
  username: 'max.bisinger',
  fullName: 'Max Bisinger',
  role: 'admin',
  password: 'ITP2024',
  isApproved: true
});

// Authentication functions
function createToken(user) {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  tokens.set(token, { user, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); // 24 hours
  return token;
}

function validateToken(token) {
  const tokenData = tokens.get(token);
  if (!tokenData) return null;
  if (tokenData.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  return tokenData.user;
}

// Authentication middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = validateToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = user;
  next();
}

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = createToken(user);
  res.json({ token, user });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic API endpoints (simplified for deployment)
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

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 5000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log('FC Köln Management System listening on port ' + port);
  console.log('Admin account: max.bisinger@warubi-sports.com / ITP2024');
  console.log('Database: In-memory storage (deployment mode)');
});

module.exports = app;`;
  
  writeFileSync('dist/index.js', serverCode);
  console.log('✅ Created simple CommonJS server');
  
  // Create deployment package.json
  const packageJson = {
    name: 'fc-koln-management',
    version: '1.0.0',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    },
    engines: {
      node: '>=20.0.0'
    },
    dependencies: {
      express: '^4.21.2'
    }
  };
  
  writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Created deployment package.json');
  
  console.log('🚀 Simple deployment ready!');
  console.log('- Pure CommonJS with no bundling issues');
  console.log('- Express server with basic authentication');
  console.log('- In-memory storage for deployment');
  console.log('- All API endpoints return empty arrays');
}

buildSimpleDeployment();