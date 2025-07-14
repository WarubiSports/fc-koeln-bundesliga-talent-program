import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// In-memory storage
let users = [
  { id: 1, email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved' },
  { id: 2, email: 'th.el@warubi-sports.com', role: 'admin', status: 'approved' }
];

let chores: any[] = [];
let choreId = 1;

// Simple auth middleware
const simpleAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token.startsWith('user_')) {
    req.user = users.find(u => u.id === 1);
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'FC Köln Management System'
  });
});

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

// Static file serving for production
if (process.env.NODE_ENV === "production") {
  const publicPath = join(__dirname, 'public');
  
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    const indexPath = join(publicPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not found');
    }
  });
}

const httpServer = createServer(app);

const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log(`Admin users: max.bisinger@warubi-sports.com, th.el@warubi-sports.com`);
  console.log(`Password: 1FCKöln`);
});