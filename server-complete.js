#!/usr/bin/env node

const express = require('express');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Complete FC Köln Management System...');

// Create Express app
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add request logging
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      const time = new Date().toLocaleTimeString();
      console.log(`${time} [express] ${logLine}`);
    }
  });

  next();
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Database storage - in-memory for now
const storage = {
  users: [
    {
      id: 'max.bisinger@warubi-sports.com',
      firstName: 'Max',
      lastName: 'Bisinger',
      email: 'max.bisinger@warubi-sports.com',
      role: 'admin',
      status: 'approved',
      password: 'ITP2024'
    },
    {
      id: 'thomas.ellinger@warubi-sports.com',
      firstName: 'Thomas',
      lastName: 'Ellinger',
      email: 'thomas.ellinger@warubi-sports.com',
      role: 'staff',
      status: 'approved',
      password: 'ITP2024'
    }
  ],
  players: [],
  events: [],
  chores: [],
  foodOrders: [],
  messages: []
};

// Helper function to generate tokens
function generateToken(userId) {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/simple-login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  const user = storage.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = generateToken(user.id);
  
  res.json({
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/verify-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // For demo purposes, accept any token starting with 'user_'
  if (token.startsWith('user_')) {
    const userId = 'max.bisinger@warubi-sports.com';
    const user = storage.users.find(u => u.id === userId);
    
    if (user) {
      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Players routes
app.get('/api/players', (req, res) => {
  res.json(storage.players);
});

app.post('/api/players', (req, res) => {
  const player = {
    id: `player_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  storage.players.push(player);
  res.json(player);
});

// Events routes
app.get('/api/events', (req, res) => {
  res.json(storage.events);
});

app.post('/api/events', (req, res) => {
  const event = {
    id: `event_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  storage.events.push(event);
  res.json(event);
});

// Chores routes
app.get('/api/chores', (req, res) => {
  res.json(storage.chores);
});

app.post('/api/chores', (req, res) => {
  const chore = {
    id: `chore_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  storage.chores.push(chore);
  res.json(chore);
});

// Food orders routes
app.get('/api/food-orders', (req, res) => {
  res.json(storage.foodOrders);
});

app.post('/api/food-orders', (req, res) => {
  const order = {
    id: `order_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  storage.foodOrders.push(order);
  res.json(order);
});

// Messages routes
app.get('/api/messages', (req, res) => {
  res.json(storage.messages);
});

app.post('/api/messages', (req, res) => {
  const message = {
    id: `message_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  storage.messages.push(message);
  res.json(message);
});

// Serve React app (built files)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`FC Köln Management System listening on port ${PORT}`);
  console.log('Thomas Ellinger delivery fix applied - staff credentials active');
  console.log('Complete application with all sections restored');
  console.log('Ready for deployment via Replit');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});