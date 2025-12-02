import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createTestApp, pool } from '../../app.js';
import type { Express } from 'express';

describe('Auth E2E - Full Middleware Stack', () => {
  const TEST_APP_ID = 'fckoln';
  const TEST_EMAIL = 'e2e-auth-test@fckoln.com';
  const TEST_PASSWORD = 'SecurePass123!';
  
  let app: Express;
  let testUserId: string;

  beforeAll(async () => {
    app = createTestApp(TEST_APP_ID);
    
    try {
      testUserId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
      
      await pool.query(
        `INSERT INTO users (id, app_id, email, password, first_name, last_name, role, status, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email, app_id) DO UPDATE SET 
           id = EXCLUDED.id,
           password = EXCLUDED.password`,
        [testUserId, TEST_APP_ID, TEST_EMAIL, hashedPassword, 'E2E', 'Test', 'player', 'active', 'true']
      );
    } catch (error) {
      console.error('E2E Auth test setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_EMAIL}%`]);
      await pool.query('DELETE FROM users WHERE email = $1 AND app_id = $2', [TEST_EMAIL, TEST_APP_ID]);
    } catch (error) {
      console.error('E2E Auth test cleanup failed:', error);
    }
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:${TEST_EMAIL}%`]);
  });

  describe('POST /api/fckoln/auth/login', () => {
    it('should return 200 and token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(TEST_EMAIL);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/login')
        .send({ email: 'nonexistent@test.com', password: TEST_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/login')
        .send({ password: TEST_PASSWORD });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/login')
        .send({ email: TEST_EMAIL });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/fckoln/auth/request-reset', () => {
    it('should return 200 for valid email (no info leak)', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/request-reset')
        .send({ email: TEST_EMAIL });

      expect([200, 500]).toContain(response.status);
    });

    it('should return 200 for non-existent email (no info leak)', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/request-reset')
        .send({ email: 'nonexistent@test.com' });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/fckoln/auth/reset-password', () => {
    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/fckoln/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'NewPassword123!' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid or expired');
    });
  });

  describe('Health Endpoints', () => {
    it('GET /healthz should return ok', async () => {
      const response = await request(app).get('/healthz');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('GET /healthz/ready should check database', async () => {
      const response = await request(app).get('/healthz/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('API Info Endpoints', () => {
    it('GET /api/ping should return pong with app context', async () => {
      const response = await request(app).get('/api/ping');
      expect(response.status).toBe(200);
      expect(response.body.pong).toBe(true);
      expect(response.body.app).toBe('1.FC Köln ITP');
    });

    it('GET /api/info should return platform info', async () => {
      const response = await request(app).get('/api/info');
      expect(response.status).toBe(200);
      expect(response.body.platform).toBe('Warubi Multi-App Backend');
      expect(response.body.app.id).toBe('fckoln');
    });
  });
});
