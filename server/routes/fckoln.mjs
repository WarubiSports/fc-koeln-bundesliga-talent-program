import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../db.cjs';
import { sendPasswordResetEmail } from '../utils/sendgrid.mjs';

// Require JWT secret - fail fast if not configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set for secure authentication');
}

const router = express.Router();

// All routes here have req.appCtx from attachAppContext middleware
// This contains: { id: 'fckoln', name: '1.FC Köln ITP', origins: [...], rps: 600 }

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Query user from database with app_id filter
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, password 
       FROM users 
       WHERE email = $1 AND app_id = $2 
       LIMIT 1`,
      [email, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, app: req.appCtx.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user info and token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Password Reset Request
router.post('/auth/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const result = await pool.query(
      `SELECT id, email, first_name FROM users WHERE email = $1 AND app_id = $2 LIMIT 1`,
      [email, req.appCtx.id]
    );

    // Always return success even if user doesn't exist (security best practice)
    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await pool.query(
      `UPDATE users SET password_reset_token = $1, password_reset_expiry = $2 WHERE id = $3`,
      [resetToken, resetExpiry, user.id]
    );

    // Send email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html`;
    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    res.json({ 
      success: true, 
      message: 'If an account exists with that email, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset request' 
    });
  }
});

// Reset Password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find user with valid token
    const result = await pool.query(
      `SELECT id, email FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expiry > NOW() 
       AND app_id = $2 
       LIMIT 1`,
      [token, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password = $1, password_reset_token = NULL, password_reset_expiry = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

// ==========================================
// PLAYER MANAGEMENT ROUTES
// ==========================================

router.get('/players', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, age, position, nationality, status, house, created_at 
       FROM players 
       WHERE app_id = $1 
       ORDER BY created_at DESC`,
      [req.appCtx.id]
    );

    // Format players
    const players = result.rows.map(row => ({
      id: row.id.toString(),
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      age: row.age,
      position: row.position,
      nationality: row.nationality,
      status: row.status,
      house: row.house,
      joinDate: row.created_at
    }));

    res.json({ success: true, players });
  } catch (error) {
    console.error('Failed to fetch players:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch players' 
    });
  }
});

// ==========================================
// EVENTS/CALENDAR ROUTES
// ==========================================

router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, type, location, description, start_time, end_time, created_at
       FROM events 
       WHERE app_id = $1 
       ORDER BY start_time DESC`,
      [req.appCtx.id]
    );

    res.json({ success: true, events: result.rows });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

// ==========================================
// GROCERY ORDERING ROUTES
// ==========================================

// Get all grocery items (optionally filtered by category)
router.get('/grocery/items', requireAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `SELECT id, name, category, price FROM grocery_items WHERE app_id = $1`;
    let params = [req.appCtx.id];
    
    if (category) {
      query += ` AND category = $2`;
      params.push(category);
    }
    
    query += ` ORDER BY category, name`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Failed to fetch grocery items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch grocery items' 
    });
  }
});

// Middleware to require JWT authentication
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required - missing token' 
    });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Verify app matches
    if (payload.app !== req.appCtx.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - wrong app' 
      });
    }
    
    req.user = payload;
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
}

// Create a new grocery order
router.post('/grocery/orders', requireAuth, async (req, res) => {
  try {
    const { deliveryDate, items } = req.body;
    const userId = req.userId;
    
    if (!deliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery date and items are required' 
      });
    }
    
    // Fetch actual prices from database to prevent price forgery
    const itemIds = items.map(item => item.itemId);
    const priceResult = await pool.query(
      `SELECT id, price FROM grocery_items WHERE id = ANY($1) AND app_id = $2`,
      [itemIds, req.appCtx.id]
    );
    
    if (priceResult.rows.length !== itemIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some items are invalid or unavailable' 
      });
    }
    
    // Create price lookup map
    const priceMap = {};
    priceResult.rows.forEach(row => {
      priceMap[row.id] = parseFloat(row.price);
    });
    
    // Calculate total amount using server-side prices
    let totalAmount = 0;
    for (const item of items) {
      const serverPrice = priceMap[item.itemId];
      if (!serverPrice || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid item or quantity' 
        });
      }
      totalAmount += serverPrice * item.quantity;
    }
    
    // Check budget limit (€35)
    if (totalAmount > 35) {
      return res.status(400).json({ 
        success: false, 
        message: `Order total (€${totalAmount.toFixed(2)}) exceeds budget limit of €35` 
      });
    }
    
    // Verify user exists and belongs to this app
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND app_id = $2 LIMIT 1`,
      [userId, req.appCtx.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not found or access denied' 
      });
    }
    
    // Create order
    const orderResult = await pool.query(
      `INSERT INTO grocery_player_orders (app_id, user_id, delivery_date, total_amount, status, submitted_at)
       VALUES ($1, $2, $3, $4, 'approved', NOW())
       RETURNING id`,
      [req.appCtx.id, userId, deliveryDate, totalAmount.toFixed(2)]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Insert order items with server-verified prices
    for (const item of items) {
      const serverPrice = priceMap[item.itemId];
      await pool.query(
        `INSERT INTO grocery_order_items (order_id, item_id, quantity, price_at_order)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.itemId, item.quantity, serverPrice.toFixed(2)]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Order created successfully',
      orderId,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Failed to create grocery order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order' 
    });
  }
});

// Get orders for a specific user
router.get('/grocery/orders', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Verify user belongs to this app
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND app_id = $2 LIMIT 1`,
      [userId, req.appCtx.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const result = await pool.query(
      `SELECT id, delivery_date, total_amount, status, created_at, submitted_at
       FROM grocery_player_orders
       WHERE app_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [req.appCtx.id, userId]
    );
    
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get a specific order with items
router.get('/grocery/orders/:id', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Get order details
    const orderResult = await pool.query(
      `SELECT o.id, o.user_id, o.delivery_date, o.total_amount, o.status, o.created_at, o.submitted_at,
              u.first_name, u.last_name, u.house
       FROM grocery_player_orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1 AND o.app_id = $2`,
      [orderId, req.appCtx.id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    const order = orderResult.rows[0];
    
    // Authorization: User can only view their own orders unless they're staff/admin
    const isStaff = req.user.role === 'admin' || req.user.role === 'staff';
    if (order.user_id !== req.userId && !isStaff) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - not your order' 
      });
    }
    
    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.quantity, oi.price_at_order,
              gi.name, gi.category
       FROM grocery_order_items oi
       JOIN grocery_items gi ON oi.item_id = gi.id
       WHERE oi.order_id = $1
       ORDER BY gi.category, gi.name`,
      [orderId]
    );
    
    res.json({ 
      success: true, 
      order: {
        ...order,
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details' 
    });
  }
});

// Get consolidated orders by house (for staff)
router.get('/grocery/orders/consolidated/:deliveryDate', requireAuth, async (req, res) => {
  try {
    // Authorization: Only staff/admin can access consolidated view
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - staff only' 
      });
    }
    
    const { deliveryDate } = req.params;
    
    // Get all orders for the delivery date
    const ordersResult = await pool.query(
      `SELECT o.id, o.user_id, o.total_amount, u.first_name, u.last_name, u.house
       FROM grocery_player_orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.app_id = $1 AND o.delivery_date = $2 AND o.status = 'approved'
       ORDER BY u.house, u.last_name`,
      [req.appCtx.id, deliveryDate]
    );
    
    // Get all order items for these orders
    const orderIds = ordersResult.rows.map(o => o.id);
    
    if (orderIds.length === 0) {
      return res.json({ success: true, consolidated: { byHouse: {}, byItem: [] } });
    }
    
    const itemsResult = await pool.query(
      `SELECT oi.order_id, oi.quantity, oi.price_at_order,
              gi.id as item_id, gi.name, gi.category
       FROM grocery_order_items oi
       JOIN grocery_items gi ON oi.item_id = gi.id
       WHERE oi.order_id = ANY($1)
       ORDER BY gi.category, gi.name`,
      [orderIds]
    );
    
    // Consolidate by house
    const byHouse = {};
    ordersResult.rows.forEach(order => {
      const house = order.house || 'Unassigned';
      if (!byHouse[house]) {
        byHouse[house] = {
          orders: [],
          totalAmount: 0
        };
      }
      byHouse[house].orders.push(order);
      byHouse[house].totalAmount += parseFloat(order.total_amount);
    });
    
    // Consolidate by item
    const itemMap = {};
    itemsResult.rows.forEach(item => {
      if (!itemMap[item.item_id]) {
        itemMap[item.item_id] = {
          itemId: item.item_id,
          name: item.name,
          category: item.category,
          totalQuantity: 0,
          price: item.price_at_order
        };
      }
      itemMap[item.item_id].totalQuantity += item.quantity;
    });
    
    const byItem = Object.values(itemMap);
    
    res.json({ 
      success: true, 
      consolidated: {
        byHouse,
        byItem,
        deliveryDate,
        totalOrders: ordersResult.rows.length
      }
    });
  } catch (error) {
    console.error('Failed to fetch consolidated orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch consolidated orders' 
    });
  }
});

// ==========================================
// ADMIN INVENTORY ROUTES
// ==========================================

// Get all grocery items (admin view - includes all items)
router.get('/admin/grocery/items', requireAuth, async (req, res) => {
  try {
    // Authorization: Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - admin only' 
      });
    }

    const result = await pool.query(
      `SELECT id, name, category, price 
       FROM grocery_items 
       WHERE app_id = $1 
       ORDER BY category, name`,
      [req.appCtx.id]
    );

    res.json({ 
      success: true, 
      items: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch items' 
    });
  }
});

// Add new grocery item
router.post('/admin/grocery/items', requireAuth, async (req, res) => {
  try {
    // Authorization: Only admin can add items
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - admin only' 
      });
    }

    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, and price are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO grocery_items (name, category, price, app_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, category, price`,
      [name, category, parseFloat(price), req.appCtx.id]
    );

    res.json({ 
      success: true, 
      message: 'Item added successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to add item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add item' 
    });
  }
});

// Update grocery item
router.put('/admin/grocery/items/:id', requireAuth, async (req, res) => {
  try {
    // Authorization: Only admin can update items
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - admin only' 
      });
    }

    const { id } = req.params;
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, category, and price are required' 
      });
    }

    const result = await pool.query(
      `UPDATE grocery_items 
       SET name = $1, category = $2, price = $3 
       WHERE id = $4 AND app_id = $5 
       RETURNING id, name, category, price`,
      [name, category, parseFloat(price), id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Failed to update item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update item' 
    });
  }
});

// Delete grocery item
router.delete('/admin/grocery/items/:id', requireAuth, async (req, res) => {
  try {
    // Authorization: Only admin can delete items
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - admin only' 
      });
    }

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM grocery_items 
       WHERE id = $1 AND app_id = $2 
       RETURNING id`,
      [id, req.appCtx.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete item' 
    });
  }
});

export default router;
