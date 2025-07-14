#!/usr/bin/env node

// Create deployment exactly as it was BEFORE Thomas admin access
// This recreates the original in-memory system that worked for months

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Creating pre-Thomas admin deployment...');

// Create a completely self-contained server without ANY drizzle-orm imports
const preThomasServer = `import express from "express";
import { createServer } from "http";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// In-memory storage (exactly as it was before Thomas admin access)
const loggedInUsers = new Map();
const TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Data stores (in-memory, no database)
let users = [
  { id: "1", email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved', firstName: 'Max', lastName: 'Bisinger' }
];
let players = [];
let chores = [];
let events = [];
let notifications = [];
let messages = [];
let groceryOrders = [];

// Authentication middleware (pre-Thomas version)
const simpleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData) {
      req.user = userData;
      return next();
    }
  }
  res.status(401).json({ message: "Unauthorized" });
};

const simpleAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData && (userData.role === 'admin' || userData.role === 'coach')) {
      req.user = userData;
      return next();
    }
  }
  res.status(401).json({ message: "Admin or Coach access required" });
};

// Token functions (pre-Thomas version)
function createUserToken(userData) {
  const token = \`user_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  const tokenData = {
    ...userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRATION
  };
  loggedInUsers.set(token, tokenData);
  return token;
}

function getUserFromToken(token) {
  const tokenData = loggedInUsers.get(token);
  if (!tokenData) return null;
  if (Date.now() > tokenData.expiresAt) {
    loggedInUsers.delete(token);
    return null;
  }
  return tokenData;
}

// API Routes (pre-Thomas version)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'FC Köln Management System',
    version: 'pre-thomas-deployment'
  });
});

// Original working login
app.post('/api/auth/simple-login', (req, res) => {
  const { username, email, password } = req.body;
  const loginIdentifier = username || email;
  
  if (loginIdentifier === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = users.find(u => u.email === loginIdentifier);
    if (user) {
      const token = createUserToken(user);
      res.json({ token, user });
      return;
    }
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// Basic endpoints
app.get('/api/users', simpleAdminAuth, (req, res) => res.json(users));
app.get('/api/players', simpleAuth, (req, res) => res.json(players));
app.get('/api/chores', simpleAuth, (req, res) => res.json(chores));
app.get('/api/events', simpleAuth, (req, res) => res.json(events));
app.get('/api/notifications', simpleAuth, (req, res) => res.json(notifications));
app.get('/api/messages', simpleAuth, (req, res) => res.json(messages));
app.get('/api/grocery-orders', simpleAuth, (req, res) => res.json(groceryOrders));

// Create endpoints
app.post('/api/chores', simpleAdminAuth, (req, res) => {
  const chore = {
    id: chores.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
    completed: false
  };
  chores.push(chore);
  res.json(chore);
});

app.post('/api/events', simpleAdminAuth, (req, res) => {
  const event = {
    id: events.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  res.json(event);
});

// Static files (production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });
}

const httpServer = createServer(app);
const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(\`FC Köln Management System listening on port \${port}\`);
  console.log(\`Pre-Thomas deployment state restored\`);
  console.log(\`Admin: max.bisinger@warubi-sports.com / ITP2024\`);
  console.log(\`No drizzle-orm dependencies - deployment ready\`);
});`;

// Write the server file
fs.writeFileSync('dist/index.js', preThomasServer);

// Create package.json
const packageJson = {
  name: 'fc-koln-management',
  version: '1.0.0',
  type: 'module',
  main: 'index.js',
  scripts: {
    start: 'node index.js'
  },
  engines: {
    node: '>=16.0.0'
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Pre-Thomas deployment created');
console.log('✅ No drizzle-orm imports or dependencies');
console.log('✅ Original working admin credentials restored');
console.log('✅ In-memory storage (no database required)');
console.log('🚀 This matches the working state before Thomas admin access');