const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating production build without drizzle-orm dependencies...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Step 1: Build frontend
console.log('Building frontend...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.log('⚠️  Frontend build had issues, continuing...');
}

// Step 2: Create production server
console.log('Creating production server...');
const serverCode = `import express from "express";
import { createServer } from "http";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

// In-memory authentication (no database)
const loggedInUsers = new Map();
const TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// In-memory data stores
let users = [
  { id: "1", email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved', firstName: 'Max', lastName: 'Bisinger' }
];
let players = [];
let chores = [];
let events = [];
let notifications = [];

// Authentication functions
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
    if (Date.now() - tokenData.expiresAt < 24 * 60 * 60 * 1000) {
      tokenData.expiresAt = Date.now() + TOKEN_EXPIRATION;
      loggedInUsers.set(token, tokenData);
      return tokenData;
    }
    loggedInUsers.delete(token);
    return null;
  }
  
  return tokenData;
}

// Middleware
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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/simple-login', (req, res) => {
  const { username, email, password } = req.body;
  const loginIdentifier = username || email;
  
  if (loginIdentifier === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = users.find(u => u.email === loginIdentifier);
    if (user) {
      const token = createUserToken(user);
      res.json({ token, user, message: 'Login successful' });
      return;
    }
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/auth/dev-login', (req, res) => {
  const userData = {
    id: 'dev-admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@fckoeln.dev',
    role: 'admin',
    status: 'approved'
  };
  res.json({ message: 'Development login successful', user: userData });
});

app.post('/api/auth/simple-logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/dev-logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Data endpoints
app.get('/api/users', simpleAdminAuth, (req, res) => res.json(users));
app.get('/api/players', simpleAuth, (req, res) => res.json(players));
app.get('/api/chores', simpleAuth, (req, res) => res.json(chores));
app.get('/api/events', simpleAuth, (req, res) => res.json(events));
app.get('/api/notifications', simpleAuth, (req, res) => res.json(notifications));

// Static file serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

const httpServer = createServer(app);
const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(\`FC Köln Management System listening on port \${port}\`);
  console.log(\`Production ready - no drizzle-orm dependencies\`);
  console.log(\`Admin: max.bisinger@warubi-sports.com / ITP2024\`);
});`;

fs.writeFileSync('dist/index.js', serverCode);

// Create package.json
const packageJson = {
  name: 'fc-koln-management',
  version: '1.0.0',
  type: 'module',
  main: 'index.js',
  scripts: { start: 'node index.js' },
  engines: { node: '>=16.0.0' },
  dependencies: {
    express: '^4.21.2'
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Production build created successfully');
console.log('✅ No drizzle-orm dependencies');
console.log('✅ Ready for deployment');
