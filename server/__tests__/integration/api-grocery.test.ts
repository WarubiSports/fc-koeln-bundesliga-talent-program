import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../../db.cjs';
import groceryRoutes from '../../routes/fckoln/grocery.routes.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing';

describe('Grocery API - HTTP Integration', () => {
  const TEST_APP_ID = 'fckoln';
  const PLAYER_EMAIL = 'grocery-api-player@fckoln.com';
  const STAFF_EMAIL = 'grocery-api-staff@fckoln.com';
  
  let app: express.Express;
  let playerUserId: string;
  let staffUserId: string;
  let playerToken: string;
  let staffToken: string;
  let testItemId: number;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    app.use((req: any, _res, next) => {
      req.appCtx = { id: TEST_APP_ID, name: 'FC Köln' };
      
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          req.user = { role: decoded.role };
          req.userId = decoded.sub;
        } catch {
        }
      }
      next();
    });
    
    app.use('/grocery', groceryRoutes);
    
    try {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      
      playerUserId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO users (id, app_id, email, password, first_name, last_name, role, status, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email, app_id) DO UPDATE SET 
           id = EXCLUDED.id,
           password = EXCLUDED.password`,
        [playerUserId, TEST_APP_ID, PLAYER_EMAIL, hashedPassword, 'Test', 'Player', 'player', 'active', 'true']
      );
      playerToken = jwt.sign({ sub: playerUserId, email: PLAYER_EMAIL, app: TEST_APP_ID, role: 'player' }, JWT_SECRET);

      staffUserId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO users (id, app_id, email, password, first_name, last_name, role, status, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email, app_id) DO UPDATE SET 
           id = EXCLUDED.id,
           password = EXCLUDED.password`,
        [staffUserId, TEST_APP_ID, STAFF_EMAIL, hashedPassword, 'Test', 'Staff', 'staff', 'active', 'true']
      );
      staffToken = jwt.sign({ sub: staffUserId, email: STAFF_EMAIL, app: TEST_APP_ID, role: 'staff' }, JWT_SECRET);

      const itemResult = await pool.query(
        `INSERT INTO grocery_items (app_id, name, category, price)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [TEST_APP_ID, 'API Test Apple', 'fruits', '2.50']
      );
      testItemId = itemResult.rows[0].id;
    } catch (error) {
      console.error('Grocery API test setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      await pool.query('DELETE FROM grocery_order_items WHERE order_id IN (SELECT id FROM grocery_player_orders WHERE user_id IN ($1, $2))', [playerUserId, staffUserId]);
      await pool.query('DELETE FROM grocery_player_orders WHERE user_id IN ($1, $2)', [playerUserId, staffUserId]);
      await pool.query('DELETE FROM grocery_items WHERE id = $1', [testItemId]);
      await pool.query('DELETE FROM users WHERE email IN ($1, $2) AND app_id = $3', [PLAYER_EMAIL, STAFF_EMAIL, TEST_APP_ID]);
    } catch (error) {
      console.error('Grocery API test cleanup failed:', error);
    }
  });

  describe('GET /grocery/items', () => {
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/grocery/items');

      expect(response.status).toBe(401);
    });

    it('should return items for authenticated user', async () => {
      const response = await request(app)
        .get('/grocery/items')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter items by category', async () => {
      const response = await request(app)
        .get('/grocery/items?category=fruits')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      response.body.items.forEach((item: any) => {
        expect(item.category).toBe('fruits');
      });
    });
  });

  describe('POST /grocery/orders', () => {
    it('should create order within budget', async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/grocery/orders')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          deliveryDate,
          items: [{ itemId: testItemId, quantity: 2 }]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(parseFloat(response.body.order.total_amount)).toBe(5.00);

      await pool.query('DELETE FROM grocery_order_items WHERE order_id = $1', [response.body.order.id]);
      await pool.query('DELETE FROM grocery_player_orders WHERE id = $1', [response.body.order.id]);
    });

    it('should reject order exceeding budget', async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/grocery/orders')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          deliveryDate,
          items: [{ itemId: testItemId, quantity: 15 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('exceeds weekly budget');
    });

    it('should return 400 for invalid item', async () => {
      const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const response = await request(app)
        .post('/grocery/orders')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({
          deliveryDate,
          items: [{ itemId: 999999, quantity: 1 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /grocery/orders', () => {
    let testOrderId: number;

    beforeAll(async () => {
      if (playerUserId) {
        const deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const result = await pool.query(
          `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id`,
          [TEST_APP_ID, playerUserId, deliveryDate, '10.00', 'pending']
        );
        testOrderId = result.rows[0].id;
      }
    });

    afterAll(async () => {
      if (testOrderId) {
        await pool.query('DELETE FROM grocery_player_orders WHERE id = $1', [testOrderId]);
      }
    });

    it('should return only own orders for player', async () => {
      const response = await request(app)
        .get('/grocery/orders')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.status).toBe(200);
      response.body.orders.forEach((order: any) => {
        expect(order.user_id).toBe(playerUserId);
      });
    });

    it('should return all orders for staff', async () => {
      const response = await request(app)
        .get('/grocery/orders')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include pagination info', async () => {
      const response = await request(app)
        .get('/grocery/orders')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBeDefined();
      expect(response.body.pagination.limit).toBeDefined();
      expect(response.body.pagination.total).toBeDefined();
    });
  });

  describe('Access Control', () => {
    it('should prevent player from creating grocery items', async () => {
      const response = await request(app)
        .post('/grocery/items')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ name: 'Test Item', category: 'fruits', price: '5.00' });

      expect(response.status).toBe(403);
    });

    it('should allow staff to create grocery items', async () => {
      const response = await request(app)
        .post('/grocery/items')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Staff Item', category: 'fruits', price: '5.00' });

      expect(response.status).toBe(201);

      if (response.body.item?.id) {
        await pool.query('DELETE FROM grocery_items WHERE id = $1', [response.body.item.id]);
      }
    });
  });
});
