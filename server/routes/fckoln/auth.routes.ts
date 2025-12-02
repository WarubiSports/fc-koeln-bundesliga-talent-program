import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
// @ts-ignore - sendgrid.mjs is a JS module
import { sendPasswordResetEmail } from '../../utils/sendgrid.mjs';
import { 
  validate, 
  loginSchema, 
  requestResetSchema, 
  resetPasswordSchema,
  type LoginInput,
  type RequestResetInput,
  type ResetPasswordInput
} from '../../validation/schemas.js';
import { 
  checkLoginAttempts, 
  recordFailedLogin, 
  clearLoginAttempts,
  checkResetRateLimit,
  recordResetAttempt 
} from '../shared/rateLimiter.js';
import { pool } from '../shared/middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '';

const hashResetToken = (token: string): string => 
  crypto.createHash('sha256').update(token).digest('hex');

interface UserRow {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
}

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginInput;

    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }

    const attemptCheck = await checkLoginAttempts(req.appCtx.id, email);
    if (!attemptCheck.allowed) {
      return res.status(429).json({ 
        success: false, 
        message: `Too many failed attempts. Try again in ${attemptCheck.lockedFor} seconds.` 
      });
    }

    const result = await pool.query(
      `SELECT id, email, password, first_name, last_name, role, status 
       FROM users WHERE email = $1 AND app_id = $2 LIMIT 1`,
      [email, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      await recordFailedLogin(req.appCtx.id, email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0] as UserRow;
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      const failedCount = await recordFailedLogin(req.appCtx.id, email);
      const remaining = 5 - failedCount;
      
      if (remaining <= 0) {
        return res.status(429).json({ 
          success: false, 
          message: 'Too many failed attempts. Account locked for 15 minutes.' 
        });
      }
      
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    await clearLoginAttempts(req.appCtx.id, email);

    const token = jwt.sign(
      { sub: user.id, email: user.email, app: req.appCtx.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/request-reset', validate(requestResetSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body as RequestResetInput;

    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }

    const rateCheck = await checkResetRateLimit(req.appCtx.id, email);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        success: false, 
        message: `Too many reset requests. Try again in ${rateCheck.waitMinutes} minutes.` 
      });
    }

    await recordResetAttempt(req.appCtx.id, email);

    const result = await pool.query(
      `SELECT id, email, first_name FROM users WHERE email = $1 AND app_id = $2 LIMIT 1`,
      [email, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'If an account exists, a reset link has been sent.' 
      });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetExpiry = new Date(Date.now() + 3600000);

    await pool.query(
      `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 
       WHERE id = $3 AND app_id = $4`,
      [resetTokenHash, resetExpiry, user.id, req.appCtx.id]
    );

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html`;
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    res.json({ 
      success: true, 
      message: 'If an account exists, a reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as ResetPasswordInput;
    const tokenHash = hashResetToken(token);

    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }

    const result = await pool.query(
      `SELECT id, email FROM users 
       WHERE password_reset_token = $1 AND password_reset_expiry > NOW() AND app_id = $2 
       LIMIT 1`,
      [tokenHash, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expiry = NULL 
       WHERE id = $2 AND app_id = $3`,
      [hashedPassword, user.id, req.appCtx.id]
    );

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

export default router;
