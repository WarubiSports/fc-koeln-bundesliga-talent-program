#!/usr/bin/env node

/**
 * Final Deployment Build Script
 * Creates a zero-dependency CommonJS deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating final deployment build...');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Create the standalone server
const serverCode = `const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Token storage
const tokens = new Map();

function createToken(user) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  tokens.set(token, { ...user, createdAt: new Date(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
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

// Simple server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
    return;
  }

  // Login endpoint
  if (pathname === '/api/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
          const user = { id: 1, email: 'max.bisinger@warubi-sports.com', name: 'Max Bisinger', role: 'admin' };
          const token = createToken(user);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ token, user }));
        } else {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Protected endpoints
  if (pathname.startsWith('/api/')) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    
    if (pathname === '/api/user') {
      res.end(JSON.stringify(user));
    } else if (pathname === '/api/players') {
      res.end(JSON.stringify([
        { id: 1, name: 'Max Bisinger', position: 'Coach', house: 'Widdersdorf 1', status: 'active' },
        { id: 2, name: 'Test Player', position: 'Forward', house: 'Widdersdorf 2', status: 'active' }
      ]));
    } else if (pathname === '/api/chores') {
      res.end(JSON.stringify([
        { id: 1, title: 'Clean Kitchen', assignedTo: 'Max Bisinger', dueDate: '2025-07-15', status: 'pending' },
        { id: 2, title: 'Vacuum Living Room', assignedTo: 'Test Player', dueDate: '2025-07-16', status: 'pending' }
      ]));
    } else if (pathname === '/api/events') {
      res.end(JSON.stringify([
        { id: 1, title: 'Team Practice', date: '2025-07-15', time: '09:00', type: 'practice' },
        { id: 2, title: 'Weight Lifting', date: '2025-07-16', time: '14:00', type: 'training' }
      ]));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // Static file serving
  const publicDir = path.join(__dirname, 'public');
  let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    if (ext === '.html') res.setHeader('Content-Type', 'text/html');
    else if (ext === '.js') res.setHeader('Content-Type', 'application/javascript');
    else if (ext === '.css') res.setHeader('Content-Type', 'text/css');
    
    res.end(fs.readFileSync(filePath));
    return;
  }

  // SPA fallback
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(indexPath));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('FC Köln Management System listening on port ' + PORT);
  console.log('Admin account available: max.bisinger@warubi-sports.com');
  console.log('Environment: ' + (process.env.NODE_ENV || 'production'));
});`;

// Write the server
fs.writeFileSync('dist/index.js', serverCode);

// Create public directory
if (!fs.existsSync('dist/public')) {
  fs.mkdirSync('dist/public', { recursive: true });
}

// Create frontend
const frontendHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln Management System</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; color: #dc143c; }
        .login-form { max-width: 400px; margin: 0 auto; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        button { background: #dc143c; color: white; padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
        button:hover { background: #b91c3c; }
        .status { margin-top: 20px; text-align: center; }
        .success { color: green; }
        .error { color: red; }
        .dashboard { display: none; }
        .dashboard.active { display: block; }
        .nav { display: flex; gap: 10px; margin-bottom: 20px; }
        .nav button { flex: 1; background: #f0f0f0; color: #333; }
        .nav button.active { background: #dc143c; color: white; }
        .content { min-height: 300px; }
        .list-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚽ FC Köln Management System</h1>
            <p>International Talent Program</p>
        </div>
        
        <div id="login-section">
            <div class="login-form">
                <h2>Login</h2>
                <form id="login-form">
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <div id="login-status" class="status"></div>
            </div>
        </div>
        
        <div id="dashboard" class="dashboard">
            <div class="nav">
                <button onclick="showSection('players')" class="nav-btn active">Players</button>
                <button onclick="showSection('chores')" class="nav-btn">Chores</button>
                <button onclick="showSection('events')" class="nav-btn">Events</button>
                <button onclick="logout()" class="nav-btn">Logout</button>
            </div>
            
            <div id="content" class="content">
                <div id="players-section">
                    <h2>Players</h2>
                    <div id="players-list"></div>
                </div>
                
                <div id="chores-section" style="display: none;">
                    <h2>Chores</h2>
                    <div id="chores-list"></div>
                </div>
                
                <div id="events-section" style="display: none;">
                    <h2>Events</h2>
                    <div id="events-list"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentToken = localStorage.getItem('token');
        let currentUser = null;
        let currentSection = 'players';
        
        if (currentToken) {
            checkAuth();
        }
        
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    currentToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('token', currentToken);
                    showDashboard();
                } else {
                    showStatus(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                showStatus('Network error', 'error');
            }
        });
        
        async function checkAuth() {
            try {
                const response = await fetch('/api/user', {
                    headers: { 'Authorization': 'Bearer ' + currentToken }
                });
                
                if (response.ok) {
                    currentUser = await response.json();
                    showDashboard();
                } else {
                    localStorage.removeItem('token');
                    currentToken = null;
                }
            } catch (error) {
                localStorage.removeItem('token');
                currentToken = null;
            }
        }
        
        function showDashboard() {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard').classList.add('active');
            loadData();
        }
        
        function showSection(section) {
            currentSection = section;
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            document.querySelectorAll('#content > div').forEach(div => div.style.display = 'none');
            document.getElementById(section + '-section').style.display = 'block';
            
            loadData();
        }
        
        async function loadData() {
            if (!currentToken) return;
            
            try {
                const response = await fetch('/api/' + currentSection, {
                    headers: { 'Authorization': 'Bearer ' + currentToken }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    displayData(data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        
        function displayData(data) {
            const container = document.getElementById(currentSection + '-list');
            container.innerHTML = data.map(item => 
                '<div class="list-item">' +
                '<strong>' + (item.name || item.title) + '</strong>' +
                (item.position ? '<br>Position: ' + item.position : '') +
                (item.house ? '<br>House: ' + item.house : '') +
                (item.assignedTo ? '<br>Assigned to: ' + item.assignedTo : '') +
                (item.dueDate ? '<br>Due: ' + item.dueDate : '') +
                (item.date ? '<br>Date: ' + item.date : '') +
                (item.time ? '<br>Time: ' + item.time : '') +
                (item.status ? '<br>Status: ' + item.status : '') +
                '</div>'
            ).join('');
        }
        
        function logout() {
            localStorage.removeItem('token');
            currentToken = null;
            currentUser = null;
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('dashboard').classList.remove('active');
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            showStatus('', '');
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('login-status');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
        }
    </script>
</body>
</html>`;

fs.writeFileSync('dist/public/index.html', frontendHtml);

// Create deployment package.json
const packageJson = {
  name: "fc-koln-management",
  version: "1.0.0",
  main: "index.js",
  scripts: {
    start: "node index.js"
  },
  engines: {
    node: ">=18.0.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Final deployment build completed successfully!');
console.log('');
console.log('📦 Build Output:');
console.log('   - dist/index.js (Zero-dependency server)');
console.log('   - dist/package.json (Deployment config)');
console.log('   - dist/public/index.html (Production frontend)');
console.log('');
console.log('🚀 Ready for deployment!');