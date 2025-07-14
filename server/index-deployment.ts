import express from "express";
import { createServer } from "http";
import { registerViteDevMiddleware } from "./vite";

const app = express();
app.use(express.json());

// In-memory storage for deployment
let users = [
  { id: 1, email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved' },
  { id: 2, email: 'th.el@warubi-sports.com', role: 'admin', status: 'approved' }
];

let chores: any[] = [];
let choreId = 1;

// Simple authentication middleware
const simpleAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token.startsWith('user_')) {
    req.user = users.find(u => u.id === 1); // Default to admin
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'FC Köln Management System'
  });
});

// Simple login
app.post('/api/simple-login', (req, res) => {
  const { email, password } = req.body;
  
  if (password === '1FCKöln') {
    const user = users.find(u => u.email === email);
    if (user) {
      const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.json({ token, user });
      return;
    }
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// Simple chores
app.post('/api/simple-chores', simpleAuth, (req, res) => {
  const choreData = req.body;
  const chore = {
    id: choreId++,
    ...choreData,
    createdAt: new Date().toISOString(),
    completed: false
  };
  chores.push(chore);
  res.json(chore);
});

app.get('/api/chores', simpleAuth, (req, res) => {
  res.json(chores);
});

// Setup development environment
if (process.env.NODE_ENV === "development") {
  registerViteDevMiddleware(app);
}

const httpServer = createServer(app);

const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log(`Admin users: max.bisinger@warubi-sports.com, th.el@warubi-sports.com`);
  console.log(`Password: 1FCKöln`);
});