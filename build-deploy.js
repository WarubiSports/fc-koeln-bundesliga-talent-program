import { build } from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';

async function deployBuild() {
  console.log('Building deployment package...');
  
  // Create a server that doesn't use drizzle-orm at all
  const serverCode = `
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory data storage
const users = [
  { id: 1, email: 'max.bisinger@warubi-sports.com', role: 'admin', status: 'approved' },
  { id: 2, email: 'th.el@warubi-sports.com', role: 'admin', status: 'approved' }
];

const chores = [];
let choreId = 1;

const server = createServer((req, res) => {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Log requests
  console.log(\`\${req.method} \${url.pathname}\`);
  
  // API Routes
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      server: 'FC Köln Management System'
    }));
    return;
  }
  
  if (url.pathname === '/api/simple-login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const user = users.find(u => u.email === email);
        
        if (user && password === '1FCKöln') {
          const token = \`user_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token, user }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  if (url.pathname === '/api/simple-chores' && req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes('user_')) {
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
          ...choreData,
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
  
  if (url.pathname === '/api/chores' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(chores));
    return;
  }
  
  // Static file serving
  try {
    const filePath = url.pathname === '/' ? 'index.html' : url.pathname.substring(1);
    const fullPath = join(__dirname, 'public', filePath);
    const content = readFileSync(fullPath);
    
    const ext = filePath.split('.').pop();
    const mimeTypes = {
      'html': 'text/html',
      'js': 'application/javascript',
      'css': 'text/css',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'json': 'application/json',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'eot': 'application/vnd.ms-fontobject'
    };
    
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  } catch {
    // SPA fallback for client-side routing
    try {
      const indexHtml = readFileSync(join(__dirname, 'public', 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHtml);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(\`FC Köln Management System listening on port \${port}\`);
  console.log(\`Admin users: max.bisinger@warubi-sports.com, th.el@warubi-sports.com\`);
  console.log(\`Password: 1FCKöln\`);
});
`;

  // Write the server file
  await mkdir('dist', { recursive: true });
  const fs = await import('fs');
  fs.writeFileSync('dist/index.js', serverCode);
  
  // Create package.json with no dependencies
  const packageJson = {
    name: 'fc-koln-management',
    version: '1.0.0',
    type: 'module',
    main: 'index.js',
    scripts: {
      start: 'node index.js'
    }
  };
  
  fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Deployment build complete - zero external dependencies');
  console.log('✅ Server uses only Node.js built-in modules');
  console.log('✅ Ready for deployment');
}

deployBuild().catch(console.error);
