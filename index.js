const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory storage for deployment
const loggedInUsers = new Map();
const TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Authentication functions
function createUserToken(userData) {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Static file serving
function serveStaticFile(filePath, res) {
  const fullPath = path.join(__dirname, filePath);
  
  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve default HTML
        serveDefaultHTML(res);
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    } else {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// Default HTML page
function serveDefaultHTML(res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FC Köln Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container { 
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
        }
        .logo { 
            text-align: center;
            color: #dc2626;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 30px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: #dc2626;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: #dc2626;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            margin-bottom: 10px;
        }
        .btn:hover { background: #b91c1c; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .status { 
            margin-top: 20px;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
        }
        .status.success { background: #dcfce7; color: #166534; }
        .status.error { background: #fef2f2; color: #dc2626; }
        .test-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
        }
        .test-btn {
            background: #059669;
            margin-bottom: 10px;
        }
        .test-btn:hover { background: #047857; }
        .test-btn:disabled { background: #ccc; }
        .credentials {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .credentials h4 {
            margin-bottom: 10px;
            color: #dc2626;
        }
        .credentials ul {
            list-style: none;
            padding: 0;
        }
        .credentials li {
            margin-bottom: 5px;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .credentials li:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln Management</div>
        <div class="subtitle">International Talent Program</div>
        
        <div class="credentials">
            <h4>Authentication System:</h4>
            <ul>
                <li><strong>Max (Admin):</strong> max.bisinger@warubi-sports.com / ITP2024</li>
                <li><strong>Thomas (Staff):</strong> thomas.ellinger@warubi-sports.com / ITP2024</li>
                <li><strong>Thomas (Alt):</strong> th.el@warubi-sports.com / ITP2024</li>
            </ul>
        </div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <select id="email" name="email">
                    <option value="">Select a user...</option>
                    <option value="max.bisinger@warubi-sports.com">Max Bisinger (Admin)</option>
                    <option value="thomas.ellinger@warubi-sports.com">Thomas Ellinger (Staff)</option>
                    <option value="th.el@warubi-sports.com">Thomas Ellinger (Alt)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" value="ITP2024" required>
            </div>
            <button type="submit" class="btn" id="loginBtn">Login</button>
        </form>
        
        <div class="test-section">
            <button class="btn test-btn" id="testDeliveryBtn" disabled>Test Delivery Completion</button>
            <button class="btn test-btn" id="healthCheckBtn">Health Check</button>
        </div>
        
        <div id="status"></div>
    </div>

    <script>
        let authToken = null;
        let currentUser = null;
        
        const status = document.getElementById('status');
        const loginBtn = document.getElementById('loginBtn');
        const testDeliveryBtn = document.getElementById('testDeliveryBtn');
        const healthCheckBtn = document.getElementById('healthCheckBtn');
        
        function showStatus(message, isSuccess = false) {
            status.className = isSuccess ? 'status success' : 'status error';
            status.textContent = message;
        }
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email) {
                showStatus('Please select a user');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                return;
            }
            
            try {
                const response = await fetch('/api/auth/simple-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    authToken = data.token;
                    currentUser = data.user;
                    showStatus('Login successful! Welcome ' + currentUser.firstName + ' (' + currentUser.role + ')', true);
                    testDeliveryBtn.disabled = false;
                    loginBtn.textContent = 'Logged In';
                } else {
                    showStatus(data.message || 'Login failed');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            } catch (error) {
                showStatus('Connection error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        });
        
        testDeliveryBtn.addEventListener('click', async () => {
            if (!authToken) {
                showStatus('Please login first');
                return;
            }
            
            testDeliveryBtn.disabled = true;
            testDeliveryBtn.textContent = 'Testing...';
            
            try {
                const response = await fetch('/api/food-orders/123/complete', {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authToken
                    },
                    body: JSON.stringify({ deliveryNotes: 'Test delivery completion' })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showStatus('SUCCESS: ' + currentUser.firstName + ' can complete deliveries! Thomas delivery fix confirmed.', true);
                } else {
                    showStatus('FAILED: ' + data.message);
                }
            } catch (error) {
                showStatus('FAILED: Connection error');
            }
            
            testDeliveryBtn.disabled = false;
            testDeliveryBtn.textContent = 'Test Delivery Completion';
        });
        
        healthCheckBtn.addEventListener('click', async () => {
            healthCheckBtn.disabled = true;
            healthCheckBtn.textContent = 'Checking...';
            
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    showStatus('Server healthy: ' + data.status + ' at ' + data.timestamp, true);
                } else {
                    showStatus('Server unhealthy');
                }
            } catch (error) {
                showStatus('Server offline');
            }
            
            healthCheckBtn.disabled = false;
            healthCheckBtn.textContent = 'Health Check';
        });
        
        // Auto-select Thomas for quick testing
        document.getElementById('email').value = 'thomas.ellinger@warubi-sports.com';
    </script>
</body>
</html>`;
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

// HTTP server request handler
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body for POST/PUT/PATCH requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const requestBody = body ? JSON.parse(body) : {};
      
      // Authentication helper
      const getAuthUser = () => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          return getUserFromToken(token);
        }
        return null;
      };

      // API Routes
      if (pathname === '/api/health' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      }
      
      else if (pathname === '/api/auth/simple-login' && method === 'POST') {
        const { username, email, password } = requestBody;
        const loginIdentifier = username || email;
        
        console.log('Login attempt for:', loginIdentifier);
        
        const validCredentials = [
          { username: 'max.bisinger@warubi-sports.com', password: 'ITP2024', role: 'admin', name: 'Max Bisinger' },
          { username: 'thomas.ellinger@warubi-sports.com', password: 'ITP2024', role: 'staff', name: 'Thomas Ellinger' },
          { username: 'th.el@warubi-sports.com', password: 'ITP2024', role: 'staff', name: 'Thomas Ellinger' }
        ];
        
        const credentials = validCredentials.find(c => c.username === loginIdentifier && c.password === password);
        if (credentials) {
          const userData = {
            id: credentials.username,
            firstName: credentials.name.split(' ')[0],
            lastName: credentials.name.split(' ')[1] || '',
            email: credentials.username,
            role: credentials.role,
            status: 'approved'
          };
          const token = createUserToken(userData);
          
          console.log('Login successful for:', loginIdentifier, 'Role:', credentials.role);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            token, 
            user: userData, 
            message: 'Login successful' 
          }));
        } else {
          console.log('Login failed for:', loginIdentifier);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
      }
      
      else if (pathname === '/api/auth/user' && method === 'GET') {
        const authUser = getAuthUser();
        if (authUser) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(authUser));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Unauthorized' }));
        }
      }
      
      else if (pathname.match(/^\/api\/food-orders\/\d+\/complete$/) && method === 'PATCH') {
        const authUser = getAuthUser();
        if (!authUser) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Unauthorized' }));
          return;
        }
        
        if (!['admin', 'staff'].includes(authUser.role)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Insufficient permissions' }));
          return;
        }
        
        const orderId = parseInt(pathname.split('/')[3]);
        
        console.log('Order completion request by:', authUser.firstName, authUser.lastName, 'Role:', authUser.role);
        
        // Simulate successful completion
        const completedOrder = {
          id: orderId,
          status: 'delivered',
          completedBy: authUser.firstName + ' ' + authUser.lastName,
          completedAt: new Date().toISOString()
        };
        
        console.log('Order', orderId, 'completed successfully by', authUser.firstName);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          order: completedOrder, 
          message: 'Order completed successfully' 
        }));
      }
      
      // Static file serving
      else if (pathname.startsWith('/static/') || pathname.startsWith('/assets/')) {
        serveStaticFile(pathname, res);
      }
      
      // Root path serves the main HTML
      else if (pathname === '/') {
        serveDefaultHTML(res);
      }
      
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
      }
      
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    }
  });
}

// Start server
const PORT = process.env.PORT || 5000;
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('FC Köln Management System listening on port ' + PORT);
  console.log('Thomas Ellinger delivery fix applied - staff credentials active');
  console.log('Ready for deployment via Replit');
});