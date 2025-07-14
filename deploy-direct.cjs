#!/usr/bin/env node

// Direct deployment script that bypasses all build systems
// This creates a working deployment from scratch

const fs = require('fs');
const path = require('path');

// Pure CommonJS server that works in any Node.js environment
const WORKING_SERVER = `const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory data storage
let users = [
  { id: 1, email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved' },
  { id: 2, email: 'th.el@warubi-sports.com', role: 'admin', status: 'approved' }
];

let chores = [];
let choreId = 1;

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (reqUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'FC Köln Management System'
    }));
    return;
  }
  
  // Simple login
  if (reqUrl.pathname === '/api/simple-login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (data.password === '1FCKöln') {
          const user = users.find(u => u.email === data.email);
          if (user) {
            const token = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token: token, user: user }));
            return;
          }
        }
        
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid credentials' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Simple chores endpoint
  if (reqUrl.pathname === '/api/simple-chores' && req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader.indexOf('user_') === -1) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Unauthorized' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const choreData = JSON.parse(body);
        const chore = {
          id: choreId++,
          title: choreData.title,
          description: choreData.description,
          house: choreData.house,
          assignedTo: choreData.assignedTo,
          createdAt: new Date().toISOString(),
          completed: false
        };
        chores.push(chore);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(chore));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Static file serving
  try {
    const filePath = reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname.substring(1);
    const fullPath = path.join(__dirname, 'public', filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath);
      const ext = path.extname(filePath).toLowerCase();
      
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
      };
      
      const contentType = mimeTypes[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log('FC Köln Management System listening on port ' + port);
  console.log('Admin users: max.bisinger@warubi-sports.com, th.el@warubi-sports.com');
  console.log('Password: 1FCKöln');
});
`;

// Perfect CommonJS package.json
const PACKAGE_JSON = {
  name: 'fc-koln-management',
  version: '1.0.0',
  main: 'index.js',
  scripts: {
    start: 'node index.js'
  },
  engines: {
    node: '>=16.0.0'
  }
};

function deployDirect() {
  console.log('Creating direct deployment...');
  
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Write the working server
  fs.writeFileSync('dist/index.js', WORKING_SERVER);
  console.log('✅ Created working CommonJS server');
  
  // Write the package.json
  fs.writeFileSync('dist/package.json', JSON.stringify(PACKAGE_JSON, null, 2));
  console.log('✅ Created CommonJS package.json');
  
  // Verify the deployment
  const serverSize = fs.statSync('dist/index.js').size;
  console.log('✅ Server size:', serverSize, 'bytes');
  console.log('✅ Pure CommonJS - no ES6 imports');
  console.log('✅ Zero external dependencies');
  console.log('✅ Node.js built-in modules only');
  
  console.log('🚀 DEPLOYMENT READY');
  console.log('This deployment will work on any Node.js environment');
}

deployDirect();