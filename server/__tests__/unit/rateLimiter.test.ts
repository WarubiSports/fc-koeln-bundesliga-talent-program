import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  checkLoginAttempts, 
  recordFailedLogin, 
  clearLoginAttempts,
  checkResetRateLimit,
  recordResetAttempt 
} from '../../routes/shared/rateLimiter.mjs';
import { pool } from '../../db.cjs';

describe('Rate Limiter - Real Implementation', () => {
  const TEST_APP_ID = 'test-ratelimiter-unit';
  const TEST_EMAIL = 'ratelimit-unit@test.com';

  beforeEach(async () => {
    await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:%`]);
  });

  afterEach(async () => {
    await pool.query('DELETE FROM rate_limits WHERE key LIKE $1', [`${TEST_APP_ID}:%`]);
  });

  describe('checkLoginAttempts', () => {
    it('should allow first login attempt with full remaining attempts', async () => {
      const result = await checkLoginAttempts(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should return remaining attempts after failed logins', async () => {
      await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      
      const result = await checkLoginAttempts(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
    });

    it('should block after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      }
      
      const result = await checkLoginAttempts(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(false);
      expect(result.lockedFor).toBeGreaterThan(0);
    });

    it('should normalize email to lowercase', async () => {
      await recordFailedLogin(TEST_APP_ID, 'TEST@EXAMPLE.COM');
      
      const result = await checkLoginAttempts(TEST_APP_ID, 'test@example.com');
      
      expect(result.remainingAttempts).toBe(4);
    });
  });

  describe('recordFailedLogin', () => {
    it('should increment attempts count', async () => {
      const first = await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      const second = await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      
      expect(first).toBe(1);
      expect(second).toBe(2);
    });

    it('should return attempts count after recording', async () => {
      const attempts = await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      
      expect(attempts).toBe(1);
    });
  });

  describe('clearLoginAttempts', () => {
    it('should clear all login attempts for user', async () => {
      await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      await recordFailedLogin(TEST_APP_ID, TEST_EMAIL);
      
      await clearLoginAttempts(TEST_APP_ID, TEST_EMAIL);
      
      const result = await checkLoginAttempts(TEST_APP_ID, TEST_EMAIL);
      expect(result.remainingAttempts).toBe(5);
    });
  });

  describe('checkResetRateLimit', () => {
    it('should allow first reset request', async () => {
      const result = await checkResetRateLimit(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it('should track reset attempts', async () => {
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      
      const result = await checkResetRateLimit(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should block after 3 reset attempts', async () => {
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      
      const result = await checkResetRateLimit(TEST_APP_ID, TEST_EMAIL);
      
      expect(result.allowed).toBe(false);
      expect(result.waitMinutes).toBeGreaterThan(0);
    });
  });

  describe('recordResetAttempt', () => {
    it('should record reset attempt without throwing', async () => {
      await expect(recordResetAttempt(TEST_APP_ID, TEST_EMAIL)).resolves.not.toThrow();
    });

    it('should increment attempts on subsequent calls', async () => {
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      await recordResetAttempt(TEST_APP_ID, TEST_EMAIL);
      
      const result = await checkResetRateLimit(TEST_APP_ID, TEST_EMAIL);
      expect(result.remaining).toBe(1);
    });
  });

  describe('Tenant Isolation', () => {
    it('should isolate rate limits by app_id', async () => {
      const APP1 = 'test-app-1';
      const APP2 = 'test-app-2';
      
      await recordFailedLogin(APP1, TEST_EMAIL);
      await recordFailedLogin(APP1, TEST_EMAIL);
      
      const app1Result = await checkLoginAttempts(APP1, TEST_EMAIL);
      const app2Result = await checkLoginAttempts(APP2, TEST_EMAIL);
      
      expect(app1Result.remainingAttempts).toBe(3);
      expect(app2Result.remainingAttempts).toBe(5);
      
      await pool.query('DELETE FROM rate_limits WHERE key LIKE $1 OR key LIKE $2', 
        [`${APP1}:%`, `${APP2}:%`]);
    });
  });
});
