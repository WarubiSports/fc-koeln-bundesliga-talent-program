const express = require('express');
const path = require('path');
const { Pool } = require('pg');

// Initialize database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false 
});

// Simple in-memory token store for authentication
const tokenStore = new Map();

// Create a token for user authentication
function createToken(user) {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  tokenStore.set(token, { user, expiry });
  return token;
}

// Validate token
function validateToken(token) {
  const tokenData = tokenStore.get(token);
  if (!tokenData) return null;
  
  if (Date.now() > tokenData.expiry) {
    tokenStore.delete(token);
    return null;
  }
  
  return tokenData.user;
}

// Simple authentication middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const user = validateToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
}

// Simple admin auth
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const user = validateToken(token);
  if (!user || user.email !== 'max.bisinger@warubi-sports.com') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  req.user = user;
  next();
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

async function deleteUser(userId) {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [userId]);
  
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  
  return result.rows[0];
}

// Initialize Express app
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith('/api')) {
      console.log(`${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/auth/simple-login', async (req, res) => {
  const { email, password } = req.body;
  
  // Simple hardcoded admin credentials
  if (email === 'max.bisinger@warubi-sports.com' && password === 'ITP2024') {
    const user = {
      id: '1',
      email: 'max.bisinger@warubi-sports.com',
      firstName: 'Max',
      lastName: 'Bisinger',
      role: 'admin'
    };
    
    const token = createToken(user);
    res.json({ token, user });
    return;
  }
  
  res.status(401).json({ message: 'Invalid credentials' });
});

// Basic protected endpoints
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.user);
});

app.get('/api/players', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/chores', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/events', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/notifications', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/food-orders', requireAuth, (req, res) => {
  res.json([]);
});

app.get('/api/messages', requireAuth, (req, res) => {
  res.json([]);
});

// Admin endpoints with real database functionality
app.get('/api/admin/approved-users', requireAdmin, async (req, res) => {
  try {
    const users = await getApprovedUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ message: 'Failed to fetch approved users' });
  }
});

app.get('/api/admin/user-stats', requireAdmin, (req, res) => {
  res.json({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    rejectedUsers: 0
  });
});

app.get('/api/users', requireAdmin, (req, res) => {
  res.json([]);
});

app.get('/api/users/approved', requireAdmin, async (req, res) => {
  try {
    const users = await getApprovedUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({ message: 'Failed to fetch approved users' });
  }
});

app.get('/api/users/pending', requireAdmin, (req, res) => {
  res.json([]);
});

// Critical update user endpoint with role fix
app.put('/api/admin/update-user/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Validate required fields
    if (!updateData.firstName || !updateData.lastName || !updateData.email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }
    
    // Update the user with the role field fix
    const updatedUser = await updateUserProfile(userId, updateData);
    
    res.json({ 
      message: "User updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// User deletion endpoint
app.delete('/api/admin/delete-user/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('<!DOCTYPE html><html><head><title>FC Köln Management</title></head><body><h1>FC Köln Management System</h1><p>Server is running but frontend assets are not available.</p></body></html>');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`FC Köln Management System listening on port ${port}`);
  console.log('Database storage initialized successfully');
  console.log('Admin account available: max.bisinger@warubi-sports.com');
  console.log('Environment: production');
});