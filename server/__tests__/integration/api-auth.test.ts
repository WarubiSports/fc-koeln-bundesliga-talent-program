import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../../db.cjs';
import authRoutes from '../../routes/fckoln/auth.routes.mjs';

describe('Auth API - HTTP Integration', () => {
  const TEST_APP_ID = 'fckoln';
  const TEST_EMAIL = 'api-auth-test@fckoln.com';
  const TEST_PASSWORD = 'SecurePass123!';
  
  let app: express.Express;
  let testUserId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    app.use((req: any, _res, next) => {
      req.appCtx = { id: TEST_APP_ID, name: 'FC Köln' };
      next();
    });
    
    app.use('/auth', authRoutes);
    
    try {
      testUserId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
      
      await pool.query(
        `INSERT INTO users (id, app_id, email, password, first_name, last_name, role, status, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email, app_id) DO UPDATE SET 
           id = EXCLUDED.id,
           password = EXCLUDED.password`,
        [testUserId, TEST_APP_ID, TEST_EMAIL, hashedPassword, 'API', 'Test', 'player', 'active', 'true']
      );
    } catch (error) {
      console.error('Auth API test setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_EMAIL}%`]);
      await pool.query('DELETE FROM users WHERE email = $1 AND app_id = $2', [TEST_EMAIL, TEST_APP_ID]);
    } catch (error) {
      console.error('Auth API test cleanup failed:', error);
    }
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_EMAIL}%`]);
  });

  describe('POST /auth/login', () => {
    it('should return 200 and token for valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(TEST_EMAIL);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: TEST_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 429 after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send({ email: TEST_EMAIL, password: 'WrongPassword' });
      }

      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword' });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many failed attempts');
    });

    it('should clear rate limit after successful login', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword' });
      await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword' });

      const successResponse = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(successResponse.status).toBe(200);

      const result = await pool.query(
        `SELECT * FROM rate_limits WHERE key = $1 AND type = 'login'`,
        [`${TEST_APP_ID}:${TEST_EMAIL.toLowerCase()}`]
      );
      expect(result.rows.length).toBe(0);
    });
  });

  describe('POST /auth/request-reset', () => {
    it('should return 200 or 500 for valid email (500 if SendGrid not configured)', async () => {
      const response = await request(app)
        .post('/auth/request-reset')
        .send({ email: TEST_EMAIL });

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('If an account exists');
      }
    });

    it('should return 200 for non-existent email (no information leak)', async () => {
      const response = await request(app)
        .post('/auth/request-reset')
        .send({ email: 'nonexistent@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should rate limit after 3 requests', async () => {
      await request(app).post('/auth/request-reset').send({ email: TEST_EMAIL });
      await request(app).post('/auth/request-reset').send({ email: TEST_EMAIL });
      await request(app).post('/auth/request-reset').send({ email: TEST_EMAIL });

      const response = await request(app)
        .post('/auth/request-reset')
        .send({ email: TEST_EMAIL });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many reset requests');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'NewPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('Validation', () => {
    it('should return 400 for missing email in login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: TEST_PASSWORD });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password in login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: TEST_EMAIL });

      expect(response.status).toBe(400);
    });
  });
});
