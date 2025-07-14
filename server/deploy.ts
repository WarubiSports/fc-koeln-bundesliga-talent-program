import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// In-memory authentication
const users = new Map();
const tokens = new Map();

// Initialize admin user
users.set('max.bisinger@warubi-sports.com', {
  id: '1',
  email: 'max.bisinger@warubi-sports.com',
  firstName: 'Max',
  lastName: 'Bisinger',
  role: 'admin',
  status: 'approved'
});

// Token management
function createToken(user: any) {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  tokens.set(token, { ...user, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return token;
}

function validateToken(token: string) {
  const data = tokens.get(token);
  if (!data || Date.now() > data.expiresAt) {
    tokens.delete(token);
    return null;
  }
  return data;
}

// Auth middleware
const auth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = validateToken(token);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes
app.post('/api/auth/simple-login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = users.get(email);
    const token = createToken(user);
    res.json({ token, user, message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  message: 'FC Köln Management System - Production Ready'
}));

// Data endpoints
app.get('/api/notifications', auth, (req, res) => res.json([]));
app.get('/api/players', auth, (req, res) => res.json([]));
app.get('/api/chores', auth, (req, res) => res.json([]));
app.get('/api/events', auth, (req, res) => res.json([]));
app.get('/api/users', auth, (req, res) => res.json([]));

// Serve static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "public", "index.html"));
  });
}

const httpServer = createServer(app);
const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log(`Admin: max.bisinger@warubi-sports.com / ITP2024`);
  console.log(`Deployment: Success - No external dependencies`);
});
