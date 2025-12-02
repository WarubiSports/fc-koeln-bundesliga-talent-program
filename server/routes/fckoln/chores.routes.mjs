import express from 'express';
import { pool, requireAuth, requireStaffOrAdmin } from '../shared/middleware.mjs';
import { 
  validate, 
  validateParams,
  validateQuery,
  createChoreSchema, 
  verifyChoreSchema,
  idParamSchema,
  choresQuerySchema
} from '../../validation/schemas.mjs';

const router = express.Router();

router.get('/', requireAuth, validateQuery(choresQuerySchema), async (req, res) => {
  try {
    const { house, status, weekStartDate, page = 1, limit = 50 } = req.validatedQuery || req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT c.*, u.first_name, u.last_name 
                 FROM chores c 
                 LEFT JOIN users u ON c.assigned_to = u.id 
                 WHERE c.app_id = $1`;
    const params = [req.appCtx.id];
    let paramIndex = 2;
    
    if (req.user.role === 'player') {
      query += ` AND c.assigned_to = $${paramIndex}`;
      params.push(req.userId);
      paramIndex++;
    }
    
    if (house) {
      query += ` AND c.house = $${paramIndex}`;
      params.push(house);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (weekStartDate) {
      query += ` AND c.week_start_date = $${paramIndex}`;
      params.push(weekStartDate);
      paramIndex++;
    }
    
    query += ` ORDER BY c.due_date ASC NULLS LAST, c.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM chores WHERE app_id = $1`,
      [req.appCtx.id]
    );
    
    res.json({ 
      success: true, 
      chores: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get chores error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chores' });
  }
});

router.post('/:id/complete', requireAuth, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkResult = await pool.query(
      `SELECT * FROM chores WHERE id = $1 AND app_id = $2`,
      [id, req.appCtx.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }
    
    const chore = checkResult.rows[0];
    
    if (req.user.role === 'player' && chore.assigned_to !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this chore' });
    }
    
    const result = await pool.query(
      `UPDATE chores SET status = 'completed', completed_at = NOW() 
       WHERE id = $1 AND app_id = $2 RETURNING *`,
      [id, req.appCtx.id]
    );
    
    res.json({ success: true, chore: result.rows[0] });
  } catch (error) {
    console.error('Complete chore error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete chore' });
  }
});

router.post('/', requireAuth, requireStaffOrAdmin, validate(createChoreSchema), async (req, res) => {
  try {
    const { title, description, house, assignedTo, dueDate, weekStartDate, frequency, isRecurring } = req.body;
    
    const result = await pool.query(
      `INSERT INTO chores (app_id, title, description, house, assigned_to, due_date, 
        week_start_date, frequency, is_recurring, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [req.appCtx.id, title, description, house, assignedTo, dueDate, 
       weekStartDate, frequency, isRecurring || false, req.userId]
    );
    
    res.status(201).json({ success: true, chore: result.rows[0] });
  } catch (error) {
    console.error('Create chore error:', error);
    res.status(500).json({ success: false, message: 'Failed to create chore' });
  }
});

router.put('/:id/verify', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), validate(verifyChoreSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    
    const newStatus = verified ? 'verified' : 'rejected';
    
    const result = await pool.query(
      `UPDATE chores SET status = $1, verified_at = NOW(), verified_by = $2 
       WHERE id = $3 AND app_id = $4 RETURNING *`,
      [newStatus, req.userId, id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }
    
    res.json({ success: true, chore: result.rows[0] });
  } catch (error) {
    console.error('Verify chore error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify chore' });
  }
});

router.delete('/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM chores WHERE id = $1 AND app_id = $2 RETURNING *`,
      [id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }
    
    res.json({ success: true, message: 'Chore deleted' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chore' });
  }
});

export default router;
