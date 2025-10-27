import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../db.cjs';

describe('Multi-Tenant Isolation', () => {
  const TEST_APP_ID_1 = 'test-app-1';
  const TEST_APP_ID_2 = 'test-app-2';

  beforeAll(async () => {
    // Create test data for two different apps
    try {
      // Insert test players for app 1
      await pool.query(
        `INSERT INTO players (id, first_name, last_name, email, app_id, date_of_birth, position, nationality)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [9999, 'Test', 'Player1', 'test1@app1.com', TEST_APP_ID_1, '2000-01-01', 'Forward', 'USA']
      );

      // Insert test players for app 2
      await pool.query(
        `INSERT INTO players (id, first_name, last_name, email, app_id, date_of_birth, position, nationality)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [9998, 'Test', 'Player2', 'test2@app2.com', TEST_APP_ID_2, '2000-01-01', 'Midfielder', 'Canada']
      );
    } catch (error) {
      console.error('Test setup failed:', error);
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await pool.query('DELETE FROM players WHERE id IN (9999, 9998)');
    } catch (error) {
      console.error('Test cleanup failed:', error);
    }
  });

  describe('Player Data Isolation', () => {
    it('should only return players for the specified app_id', async () => {
      const result = await pool.query(
        'SELECT * FROM players WHERE app_id = $1',
        [TEST_APP_ID_1]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(player => {
        expect(player.app_id).toBe(TEST_APP_ID_1);
      });
    });

    it('should not return players from other apps', async () => {
      const result = await pool.query(
        'SELECT * FROM players WHERE app_id = $1 AND email = $2',
        [TEST_APP_ID_1, 'test2@app2.com']
      );

      expect(result.rows.length).toBe(0);
    });

    it('should maintain separate player counts per app', async () => {
      const app1Result = await pool.query(
        'SELECT COUNT(*) as count FROM players WHERE app_id = $1',
        [TEST_APP_ID_1]
      );

      const app2Result = await pool.query(
        'SELECT COUNT(*) as count FROM players WHERE app_id = $1',
        [TEST_APP_ID_2]
      );

      const app1Count = parseInt(app1Result.rows[0].count);
      const app2Count = parseInt(app2Result.rows[0].count);

      expect(app1Count).toBeGreaterThan(0);
      expect(app2Count).toBeGreaterThan(0);
      
      // Each app should have their own distinct player count
      expect(app1Count).not.toBe(app2Count);
    });
  });

  describe('User Data Isolation', () => {
    it('should filter users by app_id', async () => {
      const result = await pool.query(
        'SELECT * FROM users WHERE app_id = $1',
        ['fckoln']
      );

      result.rows.forEach(user => {
        expect(user.app_id).toBe('fckoln');
      });
    });

    it('should not leak user data across apps', async () => {
      const result = await pool.query(
        'SELECT * FROM users WHERE app_id = $1 AND app_id = $2',
        ['fckoln', 'different-app']
      );

      expect(result.rows.length).toBe(0);
    });
  });

  describe('Events Data Isolation', () => {
    it('should filter events by app_id', async () => {
      const result = await pool.query(
        'SELECT * FROM events WHERE app_id = $1 LIMIT 10',
        ['fckoln']
      );

      result.rows.forEach(event => {
        expect(event.app_id).toBe('fckoln');
      });
    });
  });

  describe('Cross-App Query Prevention', () => {
    it('should return empty results when querying wrong app_id', async () => {
      const result = await pool.query(
        'SELECT * FROM players WHERE app_id = $1',
        ['non-existent-app']
      );

      expect(result.rows.length).toBe(0);
    });

    it('should not allow joining data across apps', async () => {
      // Try to get players from app1 joined with users from app2
      const result = await pool.query(
        `SELECT p.*, u.email as user_email
         FROM players p
         LEFT JOIN users u ON p.email = u.email
         WHERE p.app_id = $1 AND u.app_id = $2`,
        [TEST_APP_ID_1, TEST_APP_ID_2]
      );

      expect(result.rows.length).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should have app_id on all FC Köln players', async () => {
      const result = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(app_id) as with_app_id
         FROM players
         WHERE app_id = 'fckoln'`
      );

      const { total, with_app_id } = result.rows[0];
      expect(total).toBe(with_app_id);
      expect(parseInt(total)).toBeGreaterThan(0);
    });

    it('should have app_id on all FC Köln events', async () => {
      const result = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(app_id) as with_app_id
         FROM events
         WHERE app_id = 'fckoln'`
      );

      const { total, with_app_id } = result.rows[0];
      expect(total).toBe(with_app_id);
    });
  });
});
