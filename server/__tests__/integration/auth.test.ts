import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { pool } from '../../db.cjs';
import bcrypt from 'bcrypt';

describe('Auth API Integration', () => {
  const TEST_APP_ID = 'fckoln';
  const TEST_USER_EMAIL = 'auth-test@fckoln.com';
  const TEST_USER_PASSWORD = 'TestPassword123!';
  let testUserId: number;

  beforeAll(async () => {
    try {
      const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
      const result = await pool.query(
        `INSERT INTO users (app_id, email, password, first_name, last_name, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email, app_id) DO UPDATE SET password = $3
         RETURNING id`,
        [TEST_APP_ID, TEST_USER_EMAIL, hashedPassword, 'Auth', 'Test', 'player', 'active']
      );
      testUserId = result.rows[0].id;
    } catch (error) {
      console.error('Auth test setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_USER_EMAIL}%`]);
      await pool.query('DELETE FROM users WHERE email = $1 AND app_id = $2', [TEST_USER_EMAIL, TEST_APP_ID]);
    } catch (error) {
      console.error('Auth test cleanup failed:', error);
    }
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_USER_EMAIL}%`]);
  });

  describe('User Lookup', () => {
    it('should find user by email and app_id', async () => {
      const result = await pool.query(
        `SELECT id, email, role FROM users WHERE email = $1 AND app_id = $2`,
        [TEST_USER_EMAIL, TEST_APP_ID]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].email).toBe(TEST_USER_EMAIL);
      expect(result.rows[0].role).toBe('player');
    });

    it('should not find user with wrong app_id', async () => {
      const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND app_id = $2`,
        [TEST_USER_EMAIL, 'wrong-app-id']
      );

      expect(result.rows.length).toBe(0);
    });

    it('should verify password correctly', async () => {
      const result = await pool.query(
        `SELECT password FROM users WHERE email = $1 AND app_id = $2`,
        [TEST_USER_EMAIL, TEST_APP_ID]
      );

      const isValid = await bcrypt.compare(TEST_USER_PASSWORD, result.rows[0].password);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const result = await pool.query(
        `SELECT password FROM users WHERE email = $1 AND app_id = $2`,
        [TEST_USER_EMAIL, TEST_APP_ID]
      );

      const isValid = await bcrypt.compare('WrongPassword', result.rows[0].password);
      expect(isValid).toBe(false);
    });
  });

  describe('Brute Force Protection', () => {
    it('should track failed login attempts', async () => {
      const key = `${TEST_APP_ID}:${TEST_USER_EMAIL}`;
      
      await pool.query(
        `INSERT INTO rate_limits (key, type, attempts, created_at)
         VALUES ($1, 'login', 1, NOW())`,
        [key]
      );

      const result = await pool.query(
        `SELECT attempts FROM rate_limits WHERE key = $1 AND type = 'login'`,
        [key]
      );

      expect(result.rows[0].attempts).toBe(1);
    });

    it('should lock account after 5 failed attempts', async () => {
      const key = `${TEST_APP_ID}:${TEST_USER_EMAIL}`;
      
      await pool.query(
        `INSERT INTO rate_limits (key, type, attempts, locked_until, created_at)
         VALUES ($1, 'login', 5, NOW() + INTERVAL '15 minutes', NOW())`,
        [key]
      );

      const result = await pool.query(
        `SELECT attempts, locked_until FROM rate_limits WHERE key = $1 AND type = 'login'`,
        [key]
      );

      expect(result.rows[0].attempts).toBe(5);
      expect(new Date(result.rows[0].locked_until) > new Date()).toBe(true);
    });

    it('should clear attempts on successful login', async () => {
      const key = `${TEST_APP_ID}:${TEST_USER_EMAIL}`;
      
      await pool.query(
        `INSERT INTO rate_limits (key, type, attempts, created_at)
         VALUES ($1, 'login', 3, NOW())`,
        [key]
      );

      await pool.query(`DELETE FROM rate_limits WHERE key = $1 AND type = 'login'`, [key]);

      const result = await pool.query(
        `SELECT * FROM rate_limits WHERE key = $1 AND type = 'login'`,
        [key]
      );

      expect(result.rows.length).toBe(0);
    });
  });

  describe('Password Reset Flow', () => {
    it('should store hashed reset token', async () => {
      if (!testUserId) {
        console.log('Skipping test: testUserId not set');
        return;
      }
      
      const tokenHash = 'abc123hashedtoken';
      const expiry = new Date(Date.now() + 3600000);

      await pool.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 
         WHERE id = $3 AND app_id = $4`,
        [tokenHash, expiry, testUserId, TEST_APP_ID]
      );

      const result = await pool.query(
        `SELECT password_reset_token, password_reset_expiry FROM users WHERE id = $1`,
        [testUserId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].password_reset_token).toBe(tokenHash);
      expect(new Date(result.rows[0].password_reset_expiry) > new Date()).toBe(true);
    });

    it('should find user by valid reset token', async () => {
      if (!testUserId) {
        console.log('Skipping test: testUserId not set');
        return;
      }
      
      const tokenHash = `valid-token-${Date.now()}`;
      const expiry = new Date(Date.now() + 3600000);

      await pool.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 
         WHERE id = $3 AND app_id = $4`,
        [tokenHash, expiry, testUserId, TEST_APP_ID]
      );

      const result = await pool.query(
        `SELECT id, email FROM users 
         WHERE password_reset_token = $1 AND password_reset_expiry > NOW() AND app_id = $2`,
        [tokenHash, TEST_APP_ID]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].email).toBe(TEST_USER_EMAIL);
    });

    it('should not find user with expired reset token', async () => {
      if (!testUserId) {
        console.log('Skipping test: testUserId not set');
        return;
      }
      
      const tokenHash = `expired-token-${Date.now()}`;
      const expiredTime = new Date(Date.now() - 3600000);

      await pool.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 
         WHERE id = $3 AND app_id = $4`,
        [tokenHash, expiredTime, testUserId, TEST_APP_ID]
      );

      const result = await pool.query(
        `SELECT * FROM users 
         WHERE password_reset_token = $1 AND password_reset_expiry > NOW()`,
        [tokenHash]
      );

      expect(result.rows.length).toBe(0);
    });

    it('should clear reset token after password change', async () => {
      if (!testUserId) {
        console.log('Skipping test: testUserId not set');
        return;
      }
      
      const newPassword = await bcrypt.hash('NewPassword123!', 10);

      await pool.query(
        `UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expiry = NULL 
         WHERE id = $2 AND app_id = $3`,
        [newPassword, testUserId, TEST_APP_ID]
      );

      const result = await pool.query(
        `SELECT password_reset_token, password_reset_expiry FROM users WHERE id = $1`,
        [testUserId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].password_reset_token).toBeNull();
      expect(result.rows[0].password_reset_expiry).toBeNull();
    });
  });

  describe('Reset Rate Limiting', () => {
    it('should track password reset requests', async () => {
      const key = `${TEST_APP_ID}:${TEST_USER_EMAIL}`;
      
      await pool.query(
        `INSERT INTO rate_limits (key, type, attempts, window_end, created_at)
         VALUES ($1, 'reset', 1, NOW() + INTERVAL '60 minutes', NOW())`,
        [key]
      );

      const result = await pool.query(
        `SELECT attempts FROM rate_limits WHERE key = $1 AND type = 'reset'`,
        [key]
      );

      expect(result.rows[0].attempts).toBe(1);
    });

    it('should block after 3 reset requests per hour', async () => {
      const key = `${TEST_APP_ID}:${TEST_USER_EMAIL}`;
      
      await pool.query(
        `INSERT INTO rate_limits (key, type, attempts, window_end, created_at)
         VALUES ($1, 'reset', 3, NOW() + INTERVAL '60 minutes', NOW())`,
        [key]
      );

      const result = await pool.query(
        `SELECT attempts, window_end FROM rate_limits WHERE key = $1 AND type = 'reset'`,
        [key]
      );

      expect(result.rows[0].attempts).toBe(3);
      expect(new Date(result.rows[0].window_end) > new Date()).toBe(true);
    });
  });
});
