const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Token storage for authentication
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

// Database helper functions
async function updateUserProfile(userId, profileData) {
  const updateData = {
    updated_at: new Date()
  };

  // Include all fields that are provided (including role)
  if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
  if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
  if (profileData.email !== undefined) updateData.email = profileData.email;
  if (profileData.dateOfBirth !== undefined) updateData.date_of_birth = profileData.dateOfBirth;
  if (profileData.nationality !== undefined) updateData.nationality = profileData.nationality;
  if (profileData.position !== undefined) updateData.position = profileData.position;
  if (profileData.house !== undefined) updateData.house = profileData.house;
  if (profileData.role !== undefined) updateData.role = profileData.role; // THIS IS THE CRITICAL FIX

  // Build the SET clause dynamically
  const setClause = Object.keys(updateData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  
  const values = Object.values(updateData);
  values.push(userId); // Add userId as the last parameter

  const query = `
    UPDATE users 
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}

async function getApprovedUsers() {
  const query = `
    SELECT id, first_name, last_name, email, date_of_birth, nationality, position, house, role, status, created_at, updated_at
    FROM users 
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    dateOfBirth: row.date_of_birth,
    nationality: row.nationality,
    position: row.position,
    house: row.house,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function getFoodOrders() {
  const query = `
    SELECT id, player_name, week_start_date, delivery_day, status, estimated_cost, created_at
    FROM food_orders
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows.map(row => ({
    id: row.id,
    playerName: row.player_name,
    weekStartDate: row.week_start_date,
    deliveryDay: row.delivery_day,
    status: row.status,
    estimatedCost: row.estimated_cost,
    createdAt: row.created_at
  }));
}

async function updateFoodOrder(orderId, updates) {
  const updateData = {
    updated_at: new Date()
  };

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.adminNotes !== undefined) updateData.admin_notes = updates.adminNotes;

  const setClause = Object.keys(updateData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
  
  const values = Object.values(updateData);
  values.push(orderId);

  const query = `
    UPDATE food_orders 
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error("Food order not found");
  }

  return result.rows[0];
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

      // Routes
      if (pathname === '/api/health' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      }
      
      else if (pathname === '/api/auth/simple-login' && method === 'POST') {
        const { username, email, password } = requestBody;
        const loginIdentifier = username || email;
        
        console.log('Standalone login attempt:', loginIdentifier);
        
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token, user: userData, message: 'Login successful' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
      }
      
      else if (pathname === '/api/admin/approved-users' && method === 'GET') {
        const authUser = getAuthUser();
        if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'coach')) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Admin or Coach access required' }));
          return;
        }
        
        const users = await getApprovedUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      }
      
      else if (pathname.startsWith('/api/admin/update-user/') && method === 'PUT') {
        const authUser = getAuthUser();
        if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'coach')) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Admin or Coach access required' }));
          return;
        }
        
        const userId = pathname.split('/').pop();
        const updatedUser = await updateUserProfile(userId, requestBody);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User updated successfully', user: updatedUser }));
      }
      
      else if (pathname === '/api/food-orders' && method === 'GET') {
        const authUser = getAuthUser();
        if (!authUser) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Unauthorized' }));
          return;
        }
        
        const orders = await getFoodOrders();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(orders));
      }
      
      else if (pathname.match(/^\/api\/food-orders\/\d+\/complete$/) && method === 'PATCH') {
        const authUser = getAuthUser();
        if (!authUser || !['admin', 'staff'].includes(authUser.role)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Insufficient permissions' }));
          return;
        }
        
        const orderId = parseInt(pathname.split('/')[3]);
        const updatedOrder = await updateFoodOrder(orderId, { 
          status: 'delivered',
          adminNotes: `Marked as delivered by ${authUser.firstName} on ${new Date().toLocaleDateString()}`
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ order: updatedOrder, message: 'Order completed successfully' }));
      }
      
      else if (pathname === '/' || pathname.startsWith('/static/')) {
        // Serve frontend HTML
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
        }
        .container { 
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 420px;
            width: 100%;
        }
        .logo { 
            text-align: center;
            color: #dc2626;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 40px;
        }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus {
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
        }
        .btn:hover { background: #b91c1c; }
        .status { 
            margin-top: 20px;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
        }
        .status.success { background: #dcfce7; color: #166534; }
        .status.error { background: #fef2f2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">FC Köln Management</div>
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
        </form>
        <div id="status"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const status = document.getElementById('status');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/simple-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    status.className = 'status success';
                    status.textContent = 'Login successful! Thomas can now complete deliveries.';
                    localStorage.setItem('auth_token', data.token);
                } else {
                    status.className = 'status error';
                    status.textContent = data.message || 'Login failed';
                }
            } catch (error) {
                status.className = 'status error';
                status.textContent = 'Connection error';
            }
        });
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
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
  console.log(`FC Köln Management System listening on port ${PORT}`);
  console.log(`Database storage initialized successfully`);
  console.log(`Admin account: max.bisinger@warubi-sports.com`);
  console.log(`Thomas account: thomas.ellinger@warubi-sports.com`);
  console.log(`Environment: production`);
});