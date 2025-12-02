import express, { Request, Response } from 'express';
import { 
  pool, 
  requireAuth, 
  requireStaffOrAdmin 
} from '../shared/middleware.js';
import { 
  validate, 
  validateParams,
  validateQuery,
  createGroceryOrderSchema, 
  createGroceryItemSchema,
  updateGroceryItemSchema,
  idParamSchema,
  groceryQuerySchema,
  type CreateGroceryOrderInput,
  type CreateGroceryItemInput
} from '../../validation/schemas.js';

const router = express.Router();
const WEEKLY_BUDGET = 30;

interface GroceryItem {
  id: number;
  name: string;
  category: string;
  price: string;
}

interface GroceryOrder {
  id: number;
  user_id: string;
  delivery_date: string;
  total_amount: string;
  status: string;
}

router.get('/items', requireAuth, validateQuery(groceryQuerySchema), async (req: Request, res: Response) => {
  try {
    const { category } = req.validatedQuery || req.query;
    
    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }
    
    let query = `SELECT * FROM grocery_items WHERE app_id = $1`;
    const params: (string | number)[] = [req.appCtx.id];
    
    if (category) {
      query += ` AND category = $2`;
      params.push(category as string);
    }
    
    query += ` ORDER BY category, name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Get grocery items error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
});

router.post('/orders', requireAuth, validate(createGroceryOrderSchema), async (req: Request, res: Response) => {
  try {
    const { deliveryDate, items } = req.body as CreateGroceryOrderInput;
    const userId = req.userId;
    
    if (!req.appCtx || !userId) {
      return res.status(500).json({ success: false, message: 'Missing context' });
    }
    
    const itemIds = items.map(i => i.itemId);
    const itemsResult = await pool.query(
      `SELECT id, price FROM grocery_items WHERE id = ANY($1) AND app_id = $2`,
      [itemIds, req.appCtx.id]
    );
    
    const priceMap = new Map<number, number>(
      itemsResult.rows.map((i: { id: number; price: string }): [number, number] => [i.id, parseFloat(i.price)])
    );
    
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
    
    const order = orderResult.rows[0] as GroceryOrder;
    
    for (const item of items) {
      const price = priceMap.get(item.itemId);
      await pool.query(
        `INSERT INTO grocery_order_items (order_id, item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.itemId, item.quantity, price?.toFixed(2)]
      );
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

router.get('/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    if (!req.appCtx || !req.user || !req.userId) {
      return res.status(500).json({ success: false, message: 'Missing context' });
    }
    
    let query: string, params: (string | number)[], countQuery: string, countParams: (string | number)[];
    
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
        page, 
        limit,
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', requireAuth, validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.appCtx || !req.user || !req.userId) {
      return res.status(500).json({ success: false, message: 'Missing context' });
    }
    
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

router.post('/items', requireAuth, requireStaffOrAdmin, validate(createGroceryItemSchema), async (req: Request, res: Response) => {
  try {
    const { name, category, price } = req.body as CreateGroceryItemInput;
    
    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }
    
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

router.put('/items/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), validate(updateGroceryItemSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    
    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }
    
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

router.delete('/items/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.appCtx) {
      return res.status(500).json({ success: false, message: 'App context not found' });
    }
    
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
