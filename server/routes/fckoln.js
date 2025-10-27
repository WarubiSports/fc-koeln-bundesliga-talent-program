const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../db.cjs');

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
    const result = await db.execute(
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

    // Return user info (in production would return JWT)
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

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists for this app
    const existing = await db.execute(
      `SELECT id FROM users WHERE email = $1 AND app_id = $2`,
      [email, req.appCtx.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.execute(
      `INSERT INTO users (app_id, email, password, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role`,
      [req.appCtx.id, email, hashedPassword, firstName, lastName, role || 'player']
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// ==========================================
// PLAYER MANAGEMENT ROUTES
// ==========================================

router.get('/players', async (req, res) => {
  try {
    const result = await db.execute(
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

router.post('/players', async (req, res) => {
  try {
    const { firstName, lastName, email, age, position, nationality, house, status } = req.body;

    const result = await db.execute(
      `INSERT INTO players (app_id, first_name, last_name, email, age, position, nationality, house, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, first_name, last_name, email, age, position, nationality, house, status, created_at`,
      [req.appCtx.id, firstName, lastName, email, age, position, nationality, house, status || 'active']
    );

    const newPlayer = result.rows[0];

    res.status(201).json({
      success: true,
      player: {
        id: newPlayer.id.toString(),
        name: `${newPlayer.first_name} ${newPlayer.last_name}`.trim(),
        email: newPlayer.email,
        age: newPlayer.age,
        position: newPlayer.position,
        nationality: newPlayer.nationality,
        house: newPlayer.house,
        status: newPlayer.status,
        joinDate: newPlayer.created_at
      }
    });
  } catch (error) {
    console.error('Failed to create player:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create player' 
    });
  }
});

router.patch('/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = fields.map(field => updates[field]);

    const result = await db.execute(
      `UPDATE players 
       SET ${setClause}
       WHERE id = $1 AND app_id = $2
       RETURNING id, first_name, last_name, email, age, position, nationality, house, status`,
      [id, req.appCtx.id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    const updated = result.rows[0];

    res.json({
      success: true,
      player: {
        id: updated.id.toString(),
        name: `${updated.first_name} ${updated.last_name}`.trim(),
        email: updated.email,
        age: updated.age,
        position: updated.position,
        nationality: updated.nationality,
        house: updated.house,
        status: updated.status
      }
    });
  } catch (error) {
    console.error('Failed to update player:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update player' 
    });
  }
});

router.delete('/players/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute(
      `DELETE FROM players WHERE id = $1 AND app_id = $2 RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete player:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete player' 
    });
  }
});

// ==========================================
// EVENTS/CALENDAR ROUTES
// ==========================================

router.get('/events', async (req, res) => {
  try {
    const result = await db.execute(
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

router.post('/events', async (req, res) => {
  try {
    const { title, type, location, description, startTime, endTime } = req.body;

    const result = await db.execute(
      `INSERT INTO events (app_id, title, type, location, description, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, type, location, description, start_time, end_time, created_at`,
      [req.appCtx.id, title, type, location, description, new Date(startTime), endTime ? new Date(endTime) : null]
    );

    res.status(201).json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to create event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create event' 
    });
  }
});

router.patch('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert date strings if present
    if (updates.startTime) updates.start_time = new Date(updates.startTime);
    if (updates.endTime) updates.end_time = new Date(updates.endTime);

    const fields = Object.keys(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = fields.map(field => updates[field]);

    const result = await db.execute(
      `UPDATE events 
       SET ${setClause}
       WHERE id = $1 AND app_id = $2
       RETURNING *`,
      [id, req.appCtx.id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to update event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update event' 
    });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute(
      `DELETE FROM events WHERE id = $1 AND app_id = $2 RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete event:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete event' 
    });
  }
});

// ==========================================
// MESSAGING ROUTES
// ==========================================

router.get('/messages', async (req, res) => {
  try {
    // Get messages from last 30 days
    const result = await db.execute(
      `SELECT id, sender_id, recipient_id, group_id, content, created_at
       FROM messages 
       WHERE app_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { senderId, recipientId, groupId, content } = req.body;

    const result = await db.execute(
      `INSERT INTO messages (app_id, sender_id, recipient_id, group_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.appCtx.id, senderId, recipientId, groupId, content]
    );

    res.status(201).json({
      success: true,
      message: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
});

// ==========================================
// CHORES ROUTES
// ==========================================

router.get('/chores', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT id, title, description, assigned_to, house, priority, deadline, status, created_at
       FROM chores 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, chores: result.rows });
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chores' 
    });
  }
});

router.post('/chores', async (req, res) => {
  try {
    const { title, description, assignedTo, house, priority, deadline } = req.body;

    const result = await db.execute(
      `INSERT INTO chores (app_id, title, description, assigned_to, house, priority, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [req.appCtx.id, title, description, assignedTo, house, priority || 'medium', deadline ? new Date(deadline) : null]
    );

    res.status(201).json({
      success: true,
      chore: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to create chore:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chore' 
    });
  }
});

router.patch('/chores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    const fields = Object.keys(updates);
    const setClause = fields.map((field, idx) => `${field} = $${idx + 3}`).join(', ');
    const values = fields.map(field => updates[field]);

    const result = await db.execute(
      `UPDATE chores 
       SET ${setClause}
       WHERE id = $1 AND app_id = $2
       RETURNING *`,
      [id, req.appCtx.id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chore not found' 
      });
    }

    res.json({
      success: true,
      chore: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to update chore:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update chore' 
    });
  }
});

// ==========================================
// GROCERY ORDERS ROUTES
// ==========================================

router.get('/grocery-orders', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT id, player_id, items, total_amount, delivery_date, status, created_at
       FROM grocery_orders 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Failed to fetch grocery orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch grocery orders' 
    });
  }
});

router.post('/grocery-orders', async (req, res) => {
  try {
    const { playerId, items, totalAmount, deliveryDate } = req.body;

    const result = await db.execute(
      `INSERT INTO grocery_orders (app_id, player_id, items, total_amount, delivery_date, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.appCtx.id, playerId, JSON.stringify(items), totalAmount, deliveryDate ? new Date(deliveryDate) : null]
    );

    res.status(201).json({
      success: true,
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to create grocery order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create grocery order' 
    });
  }
});

// ==========================================
// APPLICATIONS ROUTES
// ==========================================

router.get('/applications', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT id, first_name, last_name, email, age, position, nationality, notes, status, created_at
       FROM applications 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications' 
    });
  }
});

router.post('/applications', async (req, res) => {
  try {
    const { firstName, lastName, email, age, position, nationality, notes } = req.body;

    const result = await db.execute(
      `INSERT INTO applications (app_id, first_name, last_name, email, age, position, nationality, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [req.appCtx.id, firstName, lastName, email, age, position, nationality, notes]
    );

    res.status(201).json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to create application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create application' 
    });
  }
});

router.patch('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.execute(
      `UPDATE applications 
       SET status = $3
       WHERE id = $1 AND app_id = $2
       RETURNING *`,
      [id, req.appCtx.id, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      application: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to update application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application' 
    });
  }
});

module.exports = router;
