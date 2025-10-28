import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../db.cjs';
import { sendPasswordResetEmail } from '../utils/sendgrid.mjs';

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
