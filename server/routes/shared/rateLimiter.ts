// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pool } = require('../../db.cjs');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const RESET_RATE_LIMIT = 3;
const RESET_WINDOW_MINUTES = 60;

export interface LoginAttemptResult {
  allowed: boolean;
  remainingAttempts?: number;
  lockedFor?: number;
}

export interface ResetRateLimitResult {
  allowed: boolean;
  remaining?: number;
  waitMinutes?: number;
}

export async function checkLoginAttempts(appId: string, email: string): Promise<LoginAttemptResult> {
  const key = `${appId}:${email.toLowerCase()}`;
  
  try {
    const result = await pool.query(
      `SELECT attempts, locked_until FROM rate_limits 
       WHERE key = $1 AND type = 'login'`,
      [key]
    );
    
    if (result.rows.length === 0) {
      return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }
    
    const record = result.rows[0];
    
    if (record.locked_until && new Date(record.locked_until) > new Date()) {
      const remainingSeconds = Math.ceil((new Date(record.locked_until).getTime() - Date.now()) / 1000);
      return { allowed: false, lockedFor: remainingSeconds };
    }
    
    if (record.locked_until && new Date(record.locked_until) <= new Date()) {
      await pool.query(`DELETE FROM rate_limits WHERE key = $1 AND type = 'login'`, [key]);
      return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }
    
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - record.attempts };
  } catch (error) {
    console.error('[RateLimiter] Error checking login attempts:', error);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }
}

export async function recordFailedLogin(appId: string, email: string): Promise<number> {
  const key = `${appId}:${email.toLowerCase()}`;
  
  try {
    const result = await pool.query(
      `INSERT INTO rate_limits (key, type, attempts, created_at)
       VALUES ($1, 'login', 1, NOW())
       ON CONFLICT (key, type) DO UPDATE SET
         attempts = rate_limits.attempts + 1,
         locked_until = CASE 
           WHEN rate_limits.attempts + 1 >= $2 
           THEN NOW() + INTERVAL '${LOCKOUT_DURATION_MINUTES} minutes'
           ELSE rate_limits.locked_until
         END
       RETURNING attempts`,
      [key, MAX_LOGIN_ATTEMPTS]
    );
    
    const attempts = result.rows[0]?.attempts || 1;
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      console.log(JSON.stringify({
        level: 'warn',
        category: 'security',
        type: 'login_lockout',
        appId,
        email: email.substring(0, 3) + '***',
        timestamp: new Date().toISOString()
      }));
    }
    
    return attempts;
  } catch (error) {
    console.error('[RateLimiter] Error recording failed login:', error);
    return 1;
  }
}

export async function clearLoginAttempts(appId: string, email: string): Promise<void> {
  const key = `${appId}:${email.toLowerCase()}`;
  
  try {
    await pool.query(`DELETE FROM rate_limits WHERE key = $1 AND type = 'login'`, [key]);
  } catch (error) {
    console.error('[RateLimiter] Error clearing login attempts:', error);
  }
}

export async function checkResetRateLimit(appId: string, email: string): Promise<ResetRateLimitResult> {
  const key = `${appId}:${email.toLowerCase()}`;
  
  try {
    const result = await pool.query(
      `SELECT attempts, window_end FROM rate_limits 
       WHERE key = $1 AND type = 'reset'`,
      [key]
    );
    
    if (result.rows.length === 0) {
      return { allowed: true, remaining: RESET_RATE_LIMIT };
    }
    
    const record = result.rows[0];
    
    if (new Date(record.window_end) <= new Date()) {
      await pool.query(`DELETE FROM rate_limits WHERE key = $1 AND type = 'reset'`, [key]);
      return { allowed: true, remaining: RESET_RATE_LIMIT };
    }
    
    if (record.attempts >= RESET_RATE_LIMIT) {
      const waitMinutes = Math.ceil((new Date(record.window_end).getTime() - Date.now()) / 60000);
      return { allowed: false, waitMinutes };
    }
    
    return { allowed: true, remaining: RESET_RATE_LIMIT - record.attempts };
  } catch (error) {
    console.error('[RateLimiter] Error checking reset rate limit:', error);
    return { allowed: true, remaining: RESET_RATE_LIMIT };
  }
}

export async function recordResetAttempt(appId: string, email: string): Promise<void> {
  const key = `${appId}:${email.toLowerCase()}`;
  
  try {
    await pool.query(
      `INSERT INTO rate_limits (key, type, attempts, window_end, created_at)
       VALUES ($1, 'reset', 1, NOW() + INTERVAL '${RESET_WINDOW_MINUTES} minutes', NOW())
       ON CONFLICT (key, type) DO UPDATE SET
         attempts = rate_limits.attempts + 1`,
      [key]
    );
  } catch (error) {
    console.error('[RateLimiter] Error recording reset attempt:', error);
  }
}
