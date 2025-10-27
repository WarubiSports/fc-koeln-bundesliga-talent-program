import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.cjs';

const router = express.Router();

// All routes here have req.appCtx from attachAppContext middleware
// This contains: { id: 'fckoln', name: '1.FC Köln ITP', origins: [...], rps: 600 }

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query user from database with app_id filter
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, password 
       FROM users 
       WHERE email = $1 AND app_id = $2 
       LIMIT 1`,
      [email, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Return user info
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// ==========================================
// PLAYER MANAGEMENT ROUTES
// ==========================================

router.get('/players', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, age, position, nationality, status, house, created_at 
       FROM players 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    // Format players
    const players = result.rows.map(row => ({
      id: row.id.toString(),
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      age: row.age,
      position: row.position,
      nationality: row.nationality,
      status: row.status,
      house: row.house,
      joinDate: row.created_at
    }));

    res.json({ success: true, players });
  } catch (error) {
    console.error('Failed to fetch players:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch players' 
    });
  }
});

// ==========================================
// EVENTS/CALENDAR ROUTES
// ==========================================

router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, type, location, description, start_time, end_time, created_at
       FROM events 
       WHERE app_id = $1 
       ORDER BY start_time DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, events: result.rows });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

// Add other routes as needed...

export default router;
