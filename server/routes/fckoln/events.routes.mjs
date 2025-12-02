import express from 'express';
import { pool, requireAuth, requireStaffOrAdmin } from '../shared/middleware.mjs';
import { 
  validate, 
  validateParams, 
  validateQuery,
  createEventSchema, 
  updateEventSchema, 
  attendanceSchema,
  idParamSchema,
  eventsQuerySchema
} from '../../validation/schemas.mjs';

const router = express.Router();

function expandRecurringEvents(event, startDate, endDate) {
  const events = [];
  if (!event.is_recurring || !event.recurring_pattern) {
    events.push(event);
    return events;
  }

  const eventDate = new Date(event.date);
  const end = event.recurring_end_date ? new Date(event.recurring_end_date) : endDate;
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  
  let currentDate = new Date(eventDate);
  
  while (currentDate <= end && currentDate <= rangeEnd) {
    if (currentDate >= rangeStart) {
      events.push({
        ...event,
        date: currentDate.toISOString().split('T')[0],
        isRecurringInstance: true,
        parentEventId: event.id
      });
    }
    
    if (event.recurring_pattern === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (event.recurring_pattern === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (event.recurring_pattern === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      break;
    }
  }
  
  return events;
}

router.get('/', requireAuth, validateQuery(eventsQuerySchema), async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 50 } = req.validatedQuery || req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM events WHERE app_id = $1`;
    const params = [req.appCtx.id];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND event_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    query += ` ORDER BY date ASC, start_time ASC`;
    
    let countQuery = `SELECT COUNT(*) FROM events WHERE app_id = $1`;
    const countParams = [req.appCtx.id];
    
    if (type) {
      countQuery += ` AND event_type = $2`;
      countParams.push(type);
    }
    
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);
    
    let events = result.rows;
    if (startDate && endDate) {
      events = events.flatMap(event => expandRecurringEvents(event, startDate, endDate));
    }
    
    res.json({
      success: true,
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/', requireAuth, requireStaffOrAdmin, validate(createEventSchema), async (req, res) => {
  try {
    const { 
      title, eventType, date, startTime, endTime, location, notes,
      isRecurring, recurringPattern, recurringEndDate, recurringDays, participants 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO events (app_id, title, event_type, date, start_time, end_time, location, notes, 
        created_by, is_recurring, recurring_pattern, recurring_end_date, recurring_days, participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [req.appCtx.id, title, eventType, date, startTime, endTime, location, notes,
       req.userId, isRecurring || false, recurringPattern, recurringEndDate, recurringDays, participants]
    );
    
    res.status(201).json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.put('/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), validate(updateEventSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, eventType, date, startTime, endTime, location, notes, participants } = req.body;
    
    const result = await pool.query(
      `UPDATE events SET title = COALESCE($1, title), event_type = COALESCE($2, event_type),
        date = COALESCE($3, date), start_time = COALESCE($4, start_time), end_time = COALESCE($5, end_time),
        location = COALESCE($6, location), notes = COALESCE($7, notes), participants = COALESCE($8, participants),
        updated_at = NOW()
       WHERE id = $9 AND app_id = $10 RETURNING *`,
      [title, eventType, date, startTime, endTime, location, notes, participants, id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

router.delete('/:id', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `DELETE FROM events WHERE id = $1 AND app_id = $2 RETURNING *`,
      [id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

router.get('/:id/attendance', requireAuth, validateParams(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT ea.*, u.first_name, u.last_name, u.email
       FROM event_attendance ea
       JOIN users u ON ea.user_id = u.id
       WHERE ea.event_id = $1 AND ea.app_id = $2`,
      [id, req.appCtx.id]
    );
    
    res.json({ success: true, attendance: result.rows });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

router.post('/:id/attendance', requireAuth, validateParams(idParamSchema), validate(attendanceSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, status } = req.body;
    const targetUserId = userId || req.userId;
    
    const result = await pool.query(
      `INSERT INTO event_attendance (event_id, user_id, app_id, status, marked_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = $4, marked_by = $5, updated_at = NOW()
       RETURNING *`,
      [id, targetUserId, req.appCtx.id, status, req.userId]
    );
    
    res.json({ success: true, attendance: result.rows[0] });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to update attendance' });
  }
});

export default router;
