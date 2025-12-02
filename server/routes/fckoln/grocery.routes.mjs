import express from 'express';
import { pool, requireAuth, requireStaffOrAdmin } from '../shared/middleware.mjs';
import { 
  validate, 
  validateParams,
  validateQuery,
  createGroceryOrderSchema, 
  createGroceryItemSchema,
  updateGroceryItemSchema,
  idParamSchema,
  groceryQuerySchema
} from '../../validation/schemas.mjs';

const router = express.Router();
const WEEKLY_BUDGET = 30;

router.get('/items', requireAuth, validateQuery(groceryQuerySchema), async (req, res) => {
  try {
    const { category } = req.validatedQuery || req.query;
    
    let query = `SELECT * FROM grocery_items WHERE app_id = $1`;
    const params = [req.appCtx.id];
    
    if (category) {
      query += ` AND category = $2`;
      params.push(category);
    }
    
    query += ` ORDER BY category, name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get grocery items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
});

router.post('/orders', requireAuth, validate(createGroceryOrderSchema), async (req, res) => {
  try {
    const { deliveryDate, items } = req.body;
    const userId = req.userId;
    
    const itemIds = items.map(i => i.itemId);
    const itemsResult = await pool.query(
      `SELECT id, price FROM grocery_items WHERE id = ANY($1) AND app_id = $2`,
      [itemIds, req.appCtx.id]
    );
    
    const priceMap = new Map(itemsResult.rows.map(i => [i.id, parseFloat(i.price)]));
    
    let totalAmount = 0;
    for (const item of items) {
      const price = priceMap.get(item.itemId);
      if (!price) {
        return res.status(400).json({ success: false, message: `Item ${item.itemId} not found` });
      }
      totalAmount += price * item.quantity;
    }
    
    if (totalAmount > WEEKLY_BUDGET) {
      return res.status(400).json({ 
        success: false, 
        message: `Order total (€${totalAmount.toFixed(2)}) exceeds weekly budget (€${WEEKLY_BUDGET})` 
      });
    }
    
    const orderResult = await pool.query(
      `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       RETURNING *`,
      [req.appCtx.id, userId, deliveryDate, totalAmount.toFixed(2)]
    );
    
    const order = orderResult.rows[0];
    
    for (const item of items) {
      await pool.query(
        `INSERT INTO grocery_order_items (order_id, item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.itemId, item.quantity, priceMap.get(item.itemId).toFixed(2)]
      );
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query, params, countQuery, countParams;
    
    if (req.user.role === 'player') {
      query = `SELECT * FROM grocery_player_orders WHERE app_id = $1 AND user_id = $2 
               ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      params = [req.appCtx.id, req.userId, limit, offset];
      countQuery = `SELECT COUNT(*) FROM grocery_player_orders WHERE app_id = $1 AND user_id = $2`;
      countParams = [req.appCtx.id, req.userId];
    } else {
      query = `SELECT o.*, u.first_name, u.last_name 
               FROM grocery_player_orders o
               JOIN users u ON o.user_id = u.id
               WHERE o.app_id = $1 
               ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`;
      params = [req.appCtx.id, limit, offset];
      countQuery = `SELECT COUNT(*) FROM grocery_player_orders WHERE app_id = $1`;
      countParams = [req.appCtx.id];
    }
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);
    
    res.json({ 
      success: true, 
      orders: result.rows,
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', requireAuth, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(
      `SELECT o.*, u.first_name, u.last_name 
       FROM grocery_player_orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.app_id = $2`,
      [id, req.appCtx.id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    if (req.user.role === 'player' && order.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const itemsResult = await pool.query(
      `SELECT oi.*, gi.name, gi.category 
       FROM grocery_order_items oi
       JOIN grocery_items gi ON oi.item_id = gi.id
       WHERE oi.order_id = $1`,
      [id]
    );
    
    res.json({ success: true, order: { ...order, items: itemsResult.rows } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

router.post('/items', requireAuth, requireStaffOrAdmin, validate(createGroceryItemSchema), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    
    const result = await pool.query(
      `INSERT INTO grocery_items (app_id, name, category, price) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.appCtx.id, name, category, price]
    );
    
    res.status(201).json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: 'Failed to create item' });
  }
});

router.put('/items/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), validate(updateGroceryItemSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    
    const result = await pool.query(
      `UPDATE grocery_items SET name = COALESCE($1, name), category = COALESCE($2, category), 
        price = COALESCE($3, price) WHERE id = $4 AND app_id = $5 RETURNING *`,
      [name, category, price, id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, message: 'Failed to update item' });
  }
});

router.delete('/items/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM grocery_items WHERE id = $1 AND app_id = $2 RETURNING *`,
      [id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

export default router;
