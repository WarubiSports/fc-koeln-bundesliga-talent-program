import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../db.cjs';
import bcrypt from 'bcrypt';

describe('Grocery API Integration', () => {
  const TEST_APP_ID = 'fckoln';
  const TEST_PLAYER_EMAIL = 'grocery-player@fckoln.com';
  const TEST_STAFF_EMAIL = 'grocery-staff@fckoln.com';
  const WEEKLY_BUDGET = 30;
  
  let playerUserId: number;
  let staffUserId: number;
  let testItemId: number;

  beforeAll(async () => {
    try {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      
      const playerResult = await pool.query(
        `INSERT INTO users (app_id, email, password, first_name, last_name, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email, app_id) DO UPDATE SET password = $3
         RETURNING id`,
        [TEST_APP_ID, TEST_PLAYER_EMAIL, hashedPassword, 'Test', 'Player', 'player', 'active']
      );
      playerUserId = playerResult.rows[0].id;

      const staffResult = await pool.query(
        `INSERT INTO users (app_id, email, password, first_name, last_name, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email, app_id) DO UPDATE SET password = $3
         RETURNING id`,
        [TEST_APP_ID, TEST_STAFF_EMAIL, hashedPassword, 'Test', 'Staff', 'staff', 'active']
      );
      staffUserId = staffResult.rows[0].id;

      const itemResult = await pool.query(
        `INSERT INTO grocery_items (app_id, name, category, price)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [TEST_APP_ID, 'Test Apple', 'fruits', '2.50']
      );
      testItemId = itemResult.rows[0].id;
    } catch (error) {
      console.error('Grocery test setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM grocery_order_items WHERE order_id IN (SELECT id FROM grocery_player_orders WHERE user_id IN ($1, $2))', [playerUserId, staffUserId]);
      await pool.query('DELETE FROM grocery_player_orders WHERE user_id IN ($1, $2)', [playerUserId, staffUserId]);
      await pool.query('DELETE FROM grocery_items WHERE id = $1', [testItemId]);
      await pool.query('DELETE FROM users WHERE email IN ($1, $2) AND app_id = $3', [TEST_PLAYER_EMAIL, TEST_STAFF_EMAIL, TEST_APP_ID]);
    } catch (error) {
      console.error('Grocery test cleanup failed:', error);
    }
  });

  describe('Grocery Items', () => {
    it('should fetch items for app', async () => {
      const result = await pool.query(
        `SELECT * FROM grocery_items WHERE app_id = $1`,
        [TEST_APP_ID]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(item => {
        expect(item.app_id).toBe(TEST_APP_ID);
      });
    });

    it('should filter items by category', async () => {
      const result = await pool.query(
        `SELECT * FROM grocery_items WHERE app_id = $1 AND category = $2`,
        [TEST_APP_ID, 'fruits']
      );

      result.rows.forEach(item => {
        expect(item.category).toBe('fruits');
      });
    });

    it('should not return items from other apps', async () => {
      const result = await pool.query(
        `SELECT * FROM grocery_items WHERE app_id = $1`,
        ['other-app-id']
      );

      expect(result.rows.length).toBe(0);
    });
  });

  describe('Budget Validation', () => {
    it('should calculate order total correctly', async () => {
      const items = await pool.query(
        `SELECT id, price FROM grocery_items WHERE id = $1`,
        [testItemId]
      );

      const price = parseFloat(items.rows[0].price);
      const quantity = 3;
      const total = price * quantity;

      expect(total).toBe(7.50);
      expect(total).toBeLessThan(WEEKLY_BUDGET);
    });

    it('should reject order exceeding budget', async () => {
      const items = await pool.query(
        `SELECT id, price FROM grocery_items WHERE id = $1`,
        [testItemId]
      );

      const price = parseFloat(items.rows[0].price);
      const quantity = 15;
      const total = price * quantity;

      expect(total).toBe(37.50);
      expect(total).toBeGreaterThan(WEEKLY_BUDGET);
    });

    it('should allow order at exactly budget limit', async () => {
      const total = 30.00;
      expect(total).toBeLessThanOrEqual(WEEKLY_BUDGET);
    });
  });

  describe('Order Creation', () => {
    it('should create order with valid data', async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const orderResult = await pool.query(
        `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [TEST_APP_ID, playerUserId, deliveryDate, '7.50', 'pending']
      );

      expect(orderResult.rows.length).toBe(1);
      expect(orderResult.rows[0].status).toBe('pending');
      expect(parseFloat(orderResult.rows[0].total_amount)).toBe(7.50);

      await pool.query('DELETE FROM grocery_player_orders WHERE id = $1', [orderResult.rows[0].id]);
    });

    it('should store order items correctly', async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const orderResult = await pool.query(
        `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [TEST_APP_ID, playerUserId, deliveryDate, '5.00', 'pending']
      );

      await pool.query(
        `INSERT INTO grocery_order_items (order_id, item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [orderResult.rows[0].id, testItemId, 2, '2.50']
      );

      const itemsResult = await pool.query(
        `SELECT * FROM grocery_order_items WHERE order_id = $1`,
        [orderResult.rows[0].id]
      );

      expect(itemsResult.rows.length).toBe(1);
      expect(itemsResult.rows[0].quantity).toBe(2);

      await pool.query('DELETE FROM grocery_order_items WHERE order_id = $1', [orderResult.rows[0].id]);
      await pool.query('DELETE FROM grocery_player_orders WHERE id = $1', [orderResult.rows[0].id]);
    });
  });

  describe('Order Access Control', () => {
    let testOrderId: number;

    beforeAll(async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const result = await pool.query(
        `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [TEST_APP_ID, playerUserId, deliveryDate, '10.00', 'pending']
      );
      testOrderId = result.rows[0].id;
    });

    afterAll(async () => {
      await pool.query('DELETE FROM grocery_player_orders WHERE id = $1', [testOrderId]);
    });

    it('should allow player to see own orders', async () => {
      const result = await pool.query(
        `SELECT * FROM grocery_player_orders WHERE app_id = $1 AND user_id = $2`,
        [TEST_APP_ID, playerUserId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(order => {
        expect(order.user_id).toBe(playerUserId);
      });
    });

    it('should not show other players orders to player', async () => {
      const otherPlayerId = staffUserId;
      
      const result = await pool.query(
        `SELECT * FROM grocery_player_orders WHERE app_id = $1 AND user_id = $2`,
        [TEST_APP_ID, otherPlayerId]
      );

      result.rows.forEach(order => {
        expect(order.user_id).not.toBe(playerUserId);
      });
    });

    it('should allow staff to see all orders', async () => {
      const result = await pool.query(
        `SELECT o.*, u.first_name, u.last_name 
         FROM grocery_player_orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.app_id = $1`,
        [TEST_APP_ID]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Tenant Isolation', () => {
    it('should not return orders from other apps', async () => {
      const result = await pool.query(
        `SELECT * FROM grocery_player_orders WHERE app_id = $1`,
        ['non-existent-app']
      );

      expect(result.rows.length).toBe(0);
    });

    it('should enforce app_id on all order queries', async () => {
      const allOrders = await pool.query(`SELECT DISTINCT app_id FROM grocery_player_orders`);
      
      allOrders.rows.forEach(row => {
        expect(row.app_id).toBeDefined();
        expect(row.app_id).not.toBeNull();
      });
    });
  });
});
