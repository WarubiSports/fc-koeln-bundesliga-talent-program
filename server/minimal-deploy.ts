import http from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple user storage
const users = new Map();
const tokens = new Map();

users.set('max.bisinger@warubi-sports.com', {
  id: '1',
  email: 'max.bisinger@warubi-sports.com',
  firstName: 'Max',
  lastName: 'Bisinger',
  role: 'admin'
});

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

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse JSON body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const jsonBody = body ? JSON.parse(body) : {};
      
      if (url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'FC Köln Management System - Minimal Deployment'
        }));
        return;
      }
      
      if (url.pathname === '/api/auth/simple-login' && req.method === 'POST') {
        const { email, password } = jsonBody;
        if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
          const user = users.get(email);
          const token = createToken(user);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token, user, message: 'Login successful' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
        return;
      }
      
      // Protected routes
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = validateToken(token);
        if (user) {
          if (url.pathname === '/api/notifications') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
          }
          if (url.pathname === '/api/players') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
          }
          if (url.pathname === '/api/chores') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
          }
          if (url.pathname === '/api/events') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
          }
          if (url.pathname === '/api/users') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
            return;
          }
        }
      }
      
      // Static files
      if (url.pathname === '/' || url.pathname === '/index.html') {
        try {
          const html = readFileSync(join(__dirname, 'public', 'index.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch (error) {
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }
      
      if (url.pathname === '/style.css') {
        try {
          const css = readFileSync(join(__dirname, 'public', 'style.css'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(css);
        } catch (error) {
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }
      
      if (url.pathname === '/app.js') {
        try {
          const js = readFileSync(join(__dirname, 'public', 'app.js'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(js);
        } catch (error) {
          res.writeHead(404);
          res.end('Not Found');
        }
        return;
      }
      
      // 404
      res.writeHead(404);
      res.end('Not Found');
      
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log(`Admin: max.bisinger@warubi-sports.com / ITP2024`);
  console.log(`Deployment: Minimal - No external dependencies`);
});
