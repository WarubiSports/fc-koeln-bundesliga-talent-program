import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../db.cjs';
import { sendPasswordResetEmail } from '../utils/sendgrid.mjs';

// Require JWT secret - fail fast if not configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set for secure authentication');
}

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

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, app: req.appCtx.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info and token
    res.json({
      success: true,
      token,
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

// Password Reset Request
router.post('/auth/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const result = await pool.query(
      `SELECT id, email, first_name FROM users WHERE email = $1 AND app_id = $2 LIMIT 1`,
      [email, req.appCtx.id]
    );

    // Always return success even if user doesn't exist (security best practice)
    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await pool.query(
      `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 WHERE id = $3`,
      [resetToken, resetExpiry, user.id]
    );

    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html`;
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    res.json({ 
      success: true, 
      message: 'If an account exists with that email, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset request' 
    });
  }
});

// Reset Password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find user with valid token
    const result = await pool.query(
      `SELECT id, email FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expiry > NOW() 
       AND app_id = $2 
       LIMIT 1`,
      [token, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password = $1, password_reset_token = NULL, password_reset_expiry = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
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

// Get players overview with health status (staff/admin only)
router.get('/players/overview', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff and admin can view all players
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const result = await pool.query(
      `SELECT 
        id, first_name, last_name, email, position, house, jersey_number,
        phone, phone_number,
        health_status, injury_type, injury_end_date,
        created_at
       FROM users 
       WHERE app_id = $1 AND role = 'player'
       ORDER BY house, last_name, first_name`,
      [req.appCtx.id]
    );

    // Format players with health status
    const players = result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      position: row.position,
      house: row.house,
      jerseyNumber: row.jersey_number,
      phone: row.phone || row.phone_number,
      healthStatus: row.health_status || 'healthy',
      injuryType: row.injury_type,
      injuryEndDate: row.injury_end_date,
      joinDate: row.created_at
    }));

    res.json({ success: true, players });
  } catch (error) {
    console.error('Failed to fetch players overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch players overview' 
    });
  }
});

// Update player injury status (staff/admin only)
router.put('/players/:id/injury', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff and admin can update injury status
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const { id } = req.params;
    const { healthStatus, injuryType, injuryEndDate } = req.body;

    // Validate health status
    if (!healthStatus || !['healthy', 'injured'].includes(healthStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid health status. Must be "healthy" or "injured"' 
      });
    }

    // If marking as injured, injury type is required
    if (healthStatus === 'injured' && !injuryType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Injury type is required when marking as injured' 
      });
    }

    // Update injury status
    const result = await pool.query(
      `UPDATE users 
       SET health_status = $1, 
           injury_type = $2, 
           injury_end_date = $3
       WHERE id = $4 AND app_id = $5 AND role = 'player'
       RETURNING id, first_name, last_name, health_status, injury_type, injury_end_date`,
      [
        healthStatus,
        healthStatus === 'injured' ? injuryType : null,
        healthStatus === 'injured' ? injuryEndDate : null,
        id,
        req.appCtx.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    const updatedPlayer = result.rows[0];

    res.json({ 
      success: true, 
      message: `Player injury status updated to ${healthStatus}`,
      player: {
        id: updatedPlayer.id,
        firstName: updatedPlayer.first_name,
        lastName: updatedPlayer.last_name,
        healthStatus: updatedPlayer.health_status,
        injuryType: updatedPlayer.injury_type,
        injuryEndDate: updatedPlayer.injury_end_date
      }
    });
  } catch (error) {
    console.error('Failed to update injury status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update injury status' 
    });
  }
});

// ==========================================
// EVENTS/CALENDAR ROUTES
// ==========================================

// Helper function to expand recurring events into individual instances
function expandRecurringEvents(event, startDate, endDate) {
  if (!event.is_recurring || !event.recurring_pattern) {
    return [event];
  }

  // Handle missing date range parameters
  if (!startDate || !endDate) {
    return [event];
  }

  const instances = [];
  const eventStart = new Date(event.date + 'T00:00:00');
  const rangeStart = new Date(startDate + 'T00:00:00');
  const rangeEnd = new Date(endDate + 'T00:00:00');
  
  // Validate dates
  if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
    return [event];
  }
  
  const recurringEnd = event.recurring_end_date ? new Date(event.recurring_end_date + 'T00:00:00') : rangeEnd;

  const pattern = event.recurring_pattern.toLowerCase();
  const recurringDays = event.recurring_days ? event.recurring_days.split(',').map(d => parseInt(d)) : [];

  let currentDate = new Date(Math.max(eventStart.getTime(), rangeStart.getTime()));
  
  while (currentDate <= rangeEnd && currentDate <= recurringEnd) {
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    let includeDate = false;

    if (pattern === 'daily') {
      includeDate = true;
    } else if (pattern === 'weekdays') {
      includeDate = dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri
    } else if (pattern === 'sundays') {
      includeDate = dayOfWeek === 0;
    } else if (pattern === 'custom' && recurringDays.length > 0) {
      includeDate = recurringDays.includes(dayOfWeek);
    }

    if (includeDate && currentDate >= rangeStart) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      instances.push({
        ...event,
        date: dateStr,
        parent_event_id: event.id
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
}

// Get all events (with optional filters)
router.get('/events', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, eventType } = req.query;
    
    // Fetch non-recurring events in the date range
    let query = `
      SELECT id, title, event_type, date, start_time, end_time, location, notes, created_by, created_at,
             is_recurring, recurring_pattern, recurring_end_date, recurring_days
      FROM events 
      WHERE app_id = $1 AND (is_recurring = false OR is_recurring IS NULL)
    `;
    const params = [req.appCtx.id];
    let paramIndex = 2;
    
    if (startDate) {
      query += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (eventType) {
      query += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }
    
    const nonRecurringResult = await pool.query(query, params);
    
    // Fetch recurring events that might have instances in the date range
    let recurringQuery = `
      SELECT id, title, event_type, date, start_time, end_time, location, notes, created_by, created_at,
             is_recurring, recurring_pattern, recurring_end_date, recurring_days
      FROM events 
      WHERE app_id = $1 AND is_recurring = true
    `;
    const recurringParams = [req.appCtx.id];
    let recurringParamIndex = 2;
    
    // Only include recurring events that started before the end of our range
    if (endDate) {
      recurringQuery += ` AND date <= $${recurringParamIndex}`;
      recurringParams.push(endDate);
      recurringParamIndex++;
    }
    
    // And either have no end date or end after our start date
    if (startDate) {
      recurringQuery += ` AND (recurring_end_date IS NULL OR recurring_end_date >= $${recurringParamIndex})`;
      recurringParams.push(startDate);
      recurringParamIndex++;
    }
    
    if (eventType) {
      recurringQuery += ` AND event_type = $${recurringParamIndex}`;
      recurringParams.push(eventType);
      recurringParamIndex++;
    }
    
    const recurringResult = await pool.query(recurringQuery, recurringParams);
    
    // Expand recurring events into individual instances
    const allEvents = [...nonRecurringResult.rows];
    
    // Always expand recurring events - if no date range provided, just return the base event
    for (const recurringEvent of recurringResult.rows) {
      const instances = expandRecurringEvents(recurringEvent, startDate, endDate);
      allEvents.push(...instances);
    }
    
    // Sort by date and time
    allEvents.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });
    
    res.json({ success: true, events: allEvents });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

// Create a new event (staff/admin only)
router.post('/events', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { 
      title, eventType, date, startTime, endTime, location, notes,
      isRecurring, recurringPattern, recurringEndDate, recurringDays 
    } = req.body;
    
    if (!title || !eventType || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, event type, date, start time, and end time are required' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO events (
        app_id, title, event_type, date, start_time, end_time, location, notes, created_by,
        is_recurring, recurring_pattern, recurring_end_date, recurring_days
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, title, event_type, date, start_time, end_time, location, notes, created_by, created_at,
                 is_recurring, recurring_pattern, recurring_end_date, recurring_days`,
      [
        req.appCtx.id, title, eventType, date, startTime, endTime, location, notes, req.userId,
        isRecurring || false, recurringPattern || null, recurringEndDate || null, recurringDays || null
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Event created successfully',
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

// Update an event (staff/admin only)
router.put('/events/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, eventType, date, startTime, endTime, location, notes } = req.body;
    
    if (!title || !eventType || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, event type, date, start time, and end time are required' 
      });
    }
    
    const result = await pool.query(
      `UPDATE events 
       SET title = $1, event_type = $2, date = $3, start_time = $4, end_time = $5, 
           location = $6, notes = $7, updated_at = NOW()
       WHERE id = $8 AND app_id = $9
       RETURNING id, title, event_type, date, start_time, end_time, location, notes, created_by, created_at, updated_at`,
      [title, eventType, date, startTime, endTime, location, notes, eventId, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Event updated successfully',
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

// Delete an event (staff/admin only)
router.delete('/events/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const result = await pool.query(
      `DELETE FROM events WHERE id = $1 AND app_id = $2 RETURNING id`,
      [eventId, req.appCtx.id]
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

// Get attendance for a specific event
router.get('/events/:id/attendance', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Verify event exists and belongs to this app
    const eventCheck = await pool.query(
      `SELECT id FROM events WHERE id = $1 AND app_id = $2`,
      [eventId, req.appCtx.id]
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get all attendance records with user details
    const result = await pool.query(
      `SELECT 
        ea.id, ea.event_id, ea.user_id, ea.status, ea.marked_by, ea.created_at, ea.updated_at,
        u.first_name, u.last_name, u.email, u.role
       FROM event_attendance ea
       LEFT JOIN users u ON ea.user_id = u.id
       WHERE ea.event_id = $1 AND ea.app_id = $2
       ORDER BY u.last_name, u.first_name`,
      [eventId, req.appCtx.id]
    );
    
    res.json({ 
      success: true, 
      attendance: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch attendance' 
    });
  }
});

// RSVP or mark attendance for an event
router.post('/events/:id/attendance', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId, status } = req.body;
    
    // Determine which user's attendance we're updating
    const targetUserId = userId || req.userId;
    
    // Players can only update their own attendance
    if (req.user.role === 'player' && targetUserId !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Players can only update their own attendance' 
      });
    }
    
    // Staff/admin can update any user's attendance
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';
    
    // Verify event exists and belongs to this app
    const eventCheck = await pool.query(
      `SELECT id FROM events WHERE id = $1 AND app_id = $2`,
      [eventId, req.appCtx.id]
    );
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Valid statuses
    const validStatuses = ['pending', 'attending', 'not_attending', 'attended', 'absent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    // Insert or update attendance record
    const result = await pool.query(
      `INSERT INTO event_attendance (event_id, user_id, app_id, status, marked_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (event_id, user_id, app_id) 
       DO UPDATE SET status = $4, marked_by = $5, updated_at = NOW()
       RETURNING id, event_id, user_id, status, marked_by, created_at, updated_at`,
      [eventId, targetUserId, req.appCtx.id, status, isStaffOrAdmin ? req.userId : null]
    );
    
    res.json({ 
      success: true, 
      message: 'Attendance updated successfully',
      attendance: result.rows[0] 
    });
  } catch (error) {
    console.error('Failed to update attendance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update attendance' 
    });
  }
});

// ==========================================
// GROCERY ORDERING ROUTES
// ==========================================

// Get all grocery items (optionally filtered by category)
router.get('/grocery/items', requireAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `SELECT id, name, category, price FROM grocery_items WHERE app_id = $1`;
    let params = [req.appCtx.id];
    
    if (category) {
      query += ` AND category = $2`;
      params.push(category);
    }
    
    query += ` ORDER BY category, name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Failed to fetch grocery items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch grocery items' 
    });
  }
});

// Middleware to require JWT authentication
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required - missing token' 
    });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Verify app matches
    if (payload.app !== req.appCtx.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - wrong app' 
      });
    }
    
    req.user = payload;
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
}

// Middleware to require staff or admin role
function requireStaffOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied - staff or admin role required' 
    });
  }
  next();
}

// Create a new grocery order
router.post('/grocery/orders', requireAuth, async (req, res) => {
  try {
    const { deliveryDate, items } = req.body;
    const userId = req.userId;
    
    if (!deliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery date and items are required' 
      });
    }
    
    // Fetch actual prices from database to prevent price forgery
    const itemIds = items.map(item => item.itemId);
    const priceResult = await pool.query(
      `SELECT id, price FROM grocery_items WHERE id = ANY($1) AND app_id = $2`,
      [itemIds, req.appCtx.id]
    );
    
    if (priceResult.rows.length !== itemIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some items are invalid or unavailable' 
      });
    }
    
    // Create price lookup map
    const priceMap = {};
    priceResult.rows.forEach(row => {
      priceMap[row.id] = parseFloat(row.price);
    });
    
    // Calculate total amount using server-side prices
    let totalAmount = 0;
    for (const item of items) {
      const serverPrice = priceMap[item.itemId];
      if (!serverPrice || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid item or quantity' 
        });
      }
      totalAmount += serverPrice * item.quantity;
    }
    
    // Check budget limit (€35)
    if (totalAmount > 35) {
      return res.status(400).json({ 
        success: false, 
        message: `Order total (€${totalAmount.toFixed(2)}) exceeds budget limit of €35` 
      });
    }
    
    // Verify user exists and belongs to this app
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND app_id = $2 LIMIT 1`,
      [userId, req.appCtx.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not found or access denied' 
      });
    }
    
    // Create order
    const orderResult = await pool.query(
      `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
       VALUES ($1, $2, $3, $4, 'approved', NOW())
       RETURNING id`,
      [req.appCtx.id, userId, deliveryDate, totalAmount.toFixed(2)]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Insert order items with server-verified prices
    for (const item of items) {
      const serverPrice = priceMap[item.itemId];
      await pool.query(
        `INSERT INTO grocery_order_items (order_id, item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.itemId, item.quantity, serverPrice.toFixed(2)]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Order created successfully',
      orderId,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Failed to create grocery order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order' 
    });
  }
});

// Get orders for a specific user
router.get('/grocery/orders', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Verify user belongs to this app
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND app_id = $2 LIMIT 1`,
      [userId, req.appCtx.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const result = await pool.query(
      `SELECT id, delivery_date, total_amount, status, created_at, submitted_at
       FROM grocery_player_orders
       WHERE app_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [req.appCtx.id, userId]
    );
    
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get a specific order with items
router.get('/grocery/orders/:id', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details
    const orderResult = await pool.query(
      `SELECT o.id, o.user_id, o.delivery_date, o.total_amount, o.status, o.created_at, o.submitted_at,
              u.first_name, u.last_name, u.house
       FROM grocery_player_orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.app_id = $2`,
      [orderId, req.appCtx.id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    const order = orderResult.rows[0];
    
    // Authorization: User can only view their own orders unless they're staff/admin
    const isStaff = req.user.role === 'admin' || req.user.role === 'staff';
    if (order.user_id !== req.userId && !isStaff) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - not your order' 
      });
    }
    
    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.quantity, oi.price_at_order,
              gi.name, gi.category
       FROM grocery_order_items oi
       JOIN grocery_items gi ON oi.item_id = gi.id
       WHERE oi.order_id = $1
       ORDER BY gi.category, gi.name`,
      [orderId]
    );
    
    res.json({ 
      success: true, 
      order: {
        ...order,
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details' 
    });
  }
});

// Get consolidated orders by house (for staff)
router.get('/grocery/orders/consolidated/:deliveryDate', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin can access consolidated view
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff only' 
      });
    }
    
    const { deliveryDate } = req.params;
    
    // Get all orders for the delivery date
    const ordersResult = await pool.query(
      `SELECT o.id, o.user_id, o.total_amount, u.first_name, u.last_name, u.house
       FROM grocery_player_orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.app_id = $1 AND o.delivery_date = $2 AND o.status = 'approved'
       ORDER BY u.house, u.last_name`,
      [req.appCtx.id, deliveryDate]
    );
    
    // Get all order items for these orders
    const orderIds = ordersResult.rows.map(o => o.id);
    
    if (orderIds.length === 0) {
      return res.json({ success: true, consolidated: { byHouse: {}, byItem: [] } });
    }
    
    const itemsResult = await pool.query(
      `SELECT oi.order_id, oi.quantity, oi.price_at_order,
              gi.id as item_id, gi.name, gi.category
       FROM grocery_order_items oi
       JOIN grocery_items gi ON oi.item_id = gi.id
       WHERE oi.order_id = ANY($1)
       ORDER BY gi.category, gi.name`,
      [orderIds]
    );
    
    // Consolidate by house
    const byHouse = {};
    ordersResult.rows.forEach(order => {
      const house = order.house || 'Unassigned';
      if (!byHouse[house]) {
        byHouse[house] = {
          orders: [],
          totalAmount: 0
        };
      }
      byHouse[house].orders.push(order);
      byHouse[house].totalAmount += parseFloat(order.total_amount);
    });
    
    // Consolidate by item
    const itemMap = {};
    itemsResult.rows.forEach(item => {
      if (!itemMap[item.item_id]) {
        itemMap[item.item_id] = {
          itemId: item.item_id,
          name: item.name,
          category: item.category,
          totalQuantity: 0,
          price: item.price_at_order
        };
      }
      itemMap[item.item_id].totalQuantity += item.quantity;
    });
    
    const byItem = Object.values(itemMap);
    
    res.json({ 
      success: true, 
      consolidated: {
        byHouse,
        byItem,
        deliveryDate,
        totalOrders: ordersResult.rows.length
      }
    });
  } catch (error) {
    console.error('Failed to fetch consolidated orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch consolidated orders' 
    });
  }
});

// ==========================================
// PLAYERS ROUTES
// ==========================================

// Get all players (for staff to assign chores, orders, etc.)
router.get('/players', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, house, role
       FROM users 
       WHERE app_id = $1 AND role = 'player'
       ORDER BY house, last_name, first_name`,
      [req.appCtx.id]
    );

    res.json({ 
      success: true, 
      players: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch players:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch players' 
    });
  }
});

// ==========================================
// CHORES ROUTES
// ==========================================

// Get chores for current player (this week)
router.get('/chores', requireAuth, async (req, res) => {
  try {
    // Get current week start date (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    const weekStartDate = monday.toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT c.*, 
              u.first_name, u.last_name,
              v.first_name as verified_by_first_name, v.last_name as verified_by_last_name
       FROM chores c
       LEFT JOIN users u ON c.assigned_to = u.id
       LEFT JOIN users v ON c.verified_by = v.id
       WHERE c.app_id = $1 
         AND c.assigned_to = $2 
         AND c.week_start_date = $3
       ORDER BY c.status ASC, c.created_at DESC`,
      [req.appCtx.id, req.userId, weekStartDate]
    );

    res.json({ 
      success: true, 
      chores: result.rows,
      weekStartDate
    });
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chores' 
    });
  }
});

// Mark chore as completed
router.post('/chores/:id/complete', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the chore belongs to this player
    const checkResult = await pool.query(
      `SELECT * FROM chores 
       WHERE id = $1 AND app_id = $2 AND assigned_to = $3`,
      [id, req.appCtx.id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chore not found or not assigned to you' 
      });
    }

    const result = await pool.query(
      `UPDATE chores 
       SET status = 'completed', completed_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.json({ 
      success: true, 
      message: 'Chore marked as completed',
      chore: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to complete chore:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete chore' 
    });
  }
});

// ==========================================
// ADMIN CHORES ROUTES
// ==========================================

// Get all chores for staff view (with filters)
router.get('/admin/chores', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const { house, weekStartDate, status } = req.query;

    let query = `
      SELECT c.*, 
             u.first_name, u.last_name, u.house as player_house,
             v.first_name as verified_by_first_name, v.last_name as verified_by_last_name
      FROM chores c
      LEFT JOIN users u ON c.assigned_to = u.id
      LEFT JOIN users v ON c.verified_by = v.id
      WHERE c.app_id = $1
    `;
    const params = [req.appCtx.id];

    if (house) {
      params.push(house);
      query += ` AND c.house = $${params.length}`;
    }

    if (weekStartDate) {
      params.push(weekStartDate);
      query += ` AND c.week_start_date = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ` ORDER BY c.house, c.status ASC, c.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ 
      success: true, 
      chores: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chores' 
    });
  }
});

// Create chore assignment (for one-off tasks or weekly assignments)
router.post('/admin/chores', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const { title, description, house, assignedTo, weekStartDate, dueDate, isRecurring } = req.body;

    if (!title || !house || !assignedTo || !weekStartDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, house, assignedTo, and weekStartDate are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO chores (
        app_id, title, description, house, assigned_to, week_start_date, 
        due_date, is_recurring, frequency, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.appCtx.id, 
        title, 
        description || null, 
        house, 
        assignedTo, 
        weekStartDate,
        dueDate || null,
        isRecurring !== false, // Default to true
        isRecurring !== false ? 'weekly' : 'one-time',
        'pending',
        req.userId
      ]
    );

    res.json({ 
      success: true, 
      message: 'Chore assigned successfully',
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

// Verify completed chore
router.put('/admin/chores/:id/verify', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const { id } = req.params;
    const { approved } = req.body; // true = verified, false = rejected

    const newStatus = approved ? 'verified' : 'rejected';

    const result = await pool.query(
      `UPDATE chores 
       SET status = $1, verified_at = NOW(), verified_by = $2
       WHERE id = $3 AND app_id = $4
       RETURNING *`,
      [newStatus, req.userId, id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chore not found' 
      });
    }

    res.json({ 
      success: true, 
      message: approved ? 'Chore verified' : 'Chore rejected',
      chore: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to verify chore:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify chore' 
    });
  }
});

// Delete chore assignment
router.delete('/admin/chores/:id', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff/admin only' 
      });
    }

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM chores 
       WHERE id = $1 AND app_id = $2
       RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chore not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Chore deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete chore:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete chore' 
    });
  }
});

// ==========================================
// ADMIN INVENTORY ROUTES
// ==========================================

// Get all grocery items (staff/admin view - includes all items)
router.get('/admin/grocery/items', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, price 
       FROM grocery_items 
       WHERE app_id = $1 
       ORDER BY category, name`,
      [req.appCtx.id]
    );

    res.json({ 
      success: true, 
      items: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch items' 
    });
  }
});

// Add new grocery item
router.post('/admin/grocery/items', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, and price are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO grocery_items (name, category, price, app_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, category, price`,
      [name, category, parseFloat(price), req.appCtx.id]
    );

    res.json({ 
      success: true, 
      message: 'Item added successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to add item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add item' 
    });
  }
});

// Update grocery item
router.put('/admin/grocery/items/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, and price are required' 
      });
    }

    const result = await pool.query(
      `UPDATE grocery_items 
       SET name = $1, category = $2, price = $3 
       WHERE id = $4 AND app_id = $5 
       RETURNING id, name, category, price`,
      [name, category, parseFloat(price), id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to update item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update item' 
    });
  }
});

// Delete grocery item
router.delete('/admin/grocery/items/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM grocery_items 
       WHERE id = $1 AND app_id = $2 
       RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete item' 
    });
  }
});

// ==========================================
// PLAYER PROFILE ROUTES
// ==========================================

// Get current user's profile or specific player profile by ID (staff/admin only)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { id } = req.query;
    
    // Determine which user to fetch
    let targetUserId = req.userId;
    
    // If id parameter is provided, check authorization
    if (id) {
      // Only staff and admin can view other players' profiles
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied - you can only view your own profile' 
        });
      }
      targetUserId = id;
    }
    
    const result = await pool.query(
      `SELECT 
        id, email, first_name, last_name, date_of_birth, nationality, nationality_code,
        position, preferred_foot, height, weight, jersey_number, previous_club,
        phone, phone_number, house, role, status, approved,
        emergency_contact, emergency_phone, emergency_contact_name, emergency_contact_phone,
        medical_conditions, allergies, profile_image_url,
        health_status, injury_type, injury_end_date
       FROM users 
       WHERE id = $1 AND app_id = $2 
       LIMIT 1`,
      [targetUserId, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    const user = result.rows[0];
    
    // Convert snake_case to camelCase for frontend
    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      nationality: user.nationality,
      nationalityCode: user.nationality_code,
      position: user.position,
      preferredFoot: user.preferred_foot,
      height: user.height,
      weight: user.weight,
      jerseyNumber: user.jersey_number,
      previousClub: user.previous_club,
      phone: user.phone,
      phoneNumber: user.phone_number,
      house: user.house,
      role: user.role,
      status: user.status,
      approved: user.approved,
      emergencyContact: user.emergency_contact,
      emergencyPhone: user.emergency_phone,
      emergencyContactName: user.emergency_contact_name,
      emergencyContactPhone: user.emergency_contact_phone,
      medicalConditions: user.medical_conditions,
      allergies: user.allergies,
      profileImageUrl: user.profile_image_url,
      healthStatus: user.health_status,
      injuryType: user.injury_type,
      injuryEndDate: user.injury_end_date
    };

    res.json({ success: true, profile, isViewingOther: !!id });
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Update current user's profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      nationalityCode,
      position,
      preferredFoot,
      height,
      weight,
      jerseyNumber,
      previousClub,
      phone,
      phoneNumber,
      emergencyContact,
      emergencyPhone,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      allergies
    } = req.body;

    // Players can update their own info, but not email, role, house, or admin fields
    // Build dynamic UPDATE query only for provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(dateOfBirth);
    }
    if (nationality !== undefined) {
      updates.push(`nationality = $${paramCount++}`);
      values.push(nationality);
    }
    if (nationalityCode !== undefined) {
      updates.push(`nationality_code = $${paramCount++}`);
      values.push(nationalityCode);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }
    if (preferredFoot !== undefined) {
      updates.push(`preferred_foot = $${paramCount++}`);
      values.push(preferredFoot);
    }
    if (height !== undefined) {
      updates.push(`height = $${paramCount++}`);
      values.push(height);
    }
    if (weight !== undefined) {
      updates.push(`weight = $${paramCount++}`);
      values.push(weight);
    }
    if (jerseyNumber !== undefined) {
      updates.push(`jersey_number = $${paramCount++}`);
      values.push(jerseyNumber);
    }
    if (previousClub !== undefined) {
      updates.push(`previous_club = $${paramCount++}`);
      values.push(previousClub);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(phoneNumber);
    }
    if (emergencyContact !== undefined) {
      updates.push(`emergency_contact = $${paramCount++}`);
      values.push(emergencyContact);
    }
    if (emergencyPhone !== undefined) {
      updates.push(`emergency_phone = $${paramCount++}`);
      values.push(emergencyPhone);
    }
    if (emergencyContactName !== undefined) {
      updates.push(`emergency_contact_name = $${paramCount++}`);
      values.push(emergencyContactName);
    }
    if (emergencyContactPhone !== undefined) {
      updates.push(`emergency_contact_phone = $${paramCount++}`);
      values.push(emergencyContactPhone);
    }
    if (medicalConditions !== undefined) {
      updates.push(`medical_conditions = $${paramCount++}`);
      values.push(medicalConditions);
    }
    if (allergies !== undefined) {
      updates.push(`allergies = $${paramCount++}`);
      values.push(allergies);
    }

    // Always update updatedAt
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) { // Only updatedAt
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    // Add userId and appId as final parameters
    values.push(req.userId);
    values.push(req.appCtx.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount++} AND app_id = $${paramCount++}
      RETURNING 
        id, email, first_name, last_name, date_of_birth, nationality, nationality_code,
        position, preferred_foot, height, weight, jersey_number, previous_club,
        phone, phone_number, house, role, status,
        emergency_contact, emergency_phone, emergency_contact_name, emergency_contact_phone,
        medical_conditions, allergies
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Profile not found' 
      });
    }

    const user = result.rows[0];
    
    // Convert to camelCase
    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      nationality: user.nationality,
      nationalityCode: user.nationality_code,
      position: user.position,
      preferredFoot: user.preferred_foot,
      height: user.height,
      weight: user.weight,
      jerseyNumber: user.jersey_number,
      previousClub: user.previous_club,
      phone: user.phone,
      phoneNumber: user.phone_number,
      house: user.house,
      role: user.role,
      status: user.status,
      emergencyContact: user.emergency_contact,
      emergencyPhone: user.emergency_phone,
      emergencyContactName: user.emergency_contact_name,
      emergencyContactPhone: user.emergency_contact_phone,
      medicalConditions: user.medical_conditions,
      allergies: user.allergies
    };

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// ==========================================
// USER MANAGEMENT ROUTES (ADMIN/STAFF)
// ==========================================

// Get all users (staff/admin only)
router.get('/admin/users', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, email, first_name, last_name, role, house, position, 
        jersey_number, health_status, injury_type, injury_end_date,
        approved, status, created_at
       FROM users 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      house: user.house,
      position: user.position,
      jerseyNumber: user.jersey_number,
      healthStatus: user.health_status,
      injuryType: user.injury_type,
      injuryEndDate: user.injury_end_date,
      approved: user.approved,
      status: user.status,
      createdAt: user.created_at
    }));

    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Create new user (staff/admin only)
router.post('/admin/users', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      house, 
      position,
      jerseyNumber,
      dateOfBirth,
      nationality
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name, last name, and role are required' 
      });
    }

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND app_id = $2',
      [email, req.appCtx.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate UUID for new user
    const userId = crypto.randomUUID();

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (
        id, app_id, email, password, first_name, last_name, role, 
        house, position, jersey_number, date_of_birth, nationality,
        approved, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING 
        id, email, first_name, last_name, role, house, position, 
        jersey_number, approved, status, created_at`,
      [
        userId, 
        req.appCtx.id, 
        email, 
        hashedPassword, 
        firstName, 
        lastName, 
        role,
        house || null,
        position || null,
        jerseyNumber || null,
        dateOfBirth || null,
        nationality || null,
        'true', // Auto-approve
        'active'
      ]
    );

    const user = result.rows[0];

    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        house: user.house,
        position: user.position,
        jerseyNumber: user.jersey_number,
        approved: user.approved,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});

// Update user (staff/admin only)
router.put('/admin/users/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      house, 
      position,
      jerseyNumber,
      dateOfBirth,
      nationality,
      status,
      password // Optional password reset
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (house !== undefined) {
      updates.push(`house = $${paramCount++}`);
      values.push(house);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }
    if (jerseyNumber !== undefined) {
      updates.push(`jersey_number = $${paramCount++}`);
      values.push(jerseyNumber);
    }
    if (dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(dateOfBirth);
    }
    if (nationality !== undefined) {
      updates.push(`nationality = $${paramCount++}`);
      values.push(nationality);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    updates.push(`updated_at = NOW()`);

    // Add id and app_id as final parameters
    values.push(id);
    values.push(req.appCtx.id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount++} AND app_id = $${paramCount++}
      RETURNING 
        id, email, first_name, last_name, role, house, position, 
        jersey_number, status, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        house: user.house,
        position: user.position,
        jerseyNumber: user.jersey_number,
        status: user.status,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});

// Delete user (staff/admin only)
router.delete('/admin/users/:id', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const result = await pool.query(
      `DELETE FROM users 
       WHERE id = $1 AND app_id = $2 
       RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

export default router;
