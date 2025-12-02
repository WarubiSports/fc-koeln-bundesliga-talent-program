import express from 'express';
import { pool, requireAuth, requireStaffOrAdmin } from '../shared/middleware.mjs';
import { validate, validateParams, updateInjurySchema, updateProfileSchema, idParamSchema } from '../../validation/schemas.mjs';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, position, house, status, health_status, 
        injury_type, injury_date, injury_end_date, profile_image_url
       FROM users 
       WHERE app_id = $1 AND role = 'player'
       ORDER BY last_name, first_name
       LIMIT $2 OFFSET $3`,
      [req.appCtx.id, limit, offset]
    );
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE app_id = $1 AND role = 'player'`,
      [req.appCtx.id]
    );
    
    res.json({ 
      success: true, 
      players: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch players' });
  }
});

router.get('/overview', requireAuth, requireStaffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, position, house, health_status, 
        injury_type, injury_date, injury_end_date, profile_image_url
       FROM users 
       WHERE app_id = $1 AND role = 'player'
       ORDER BY 
         CASE WHEN health_status = 'injured' THEN 0 ELSE 1 END,
         last_name, first_name`,
      [req.appCtx.id]
    );
    
    const healthySummary = result.rows.filter(p => p.health_status !== 'injured').length;
    const injuredSummary = result.rows.filter(p => p.health_status === 'injured').length;
    
    res.json({ 
      success: true, 
      players: result.rows,
      summary: { healthy: healthySummary, injured: injuredSummary, total: result.rows.length }
    });
  } catch (error) {
    console.error('Get players overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overview' });
  }
});

router.put('/:id/injury', requireAuth, requireStaffOrAdmin, validateParams(idParamSchema), validate(updateInjurySchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { healthStatus, injuryType, injuryDate, injuryEndDate } = req.body;
    
    const result = await pool.query(
      `UPDATE users SET 
        health_status = $1,
        injury_type = CASE WHEN $1 = 'injured' THEN $2 ELSE NULL END,
        injury_date = CASE WHEN $1 = 'injured' THEN $3 ELSE NULL END,
        injury_end_date = CASE WHEN $1 = 'injured' THEN $4 ELSE NULL END,
        updated_at = NOW()
       WHERE id = $5 AND app_id = $6 AND role = 'player'
       RETURNING id, first_name, last_name, health_status, injury_type, injury_date, injury_end_date`,
      [healthStatus, injuryType, injuryDate, injuryEndDate, id, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    
    res.json({ success: true, player: result.rows[0] });
  } catch (error) {
    console.error('Update injury status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update injury status' });
  }
});

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, profile_image_url, date_of_birth,
        nationality, position, phone_number, emergency_contact_name, emergency_contact_phone,
        medical_conditions, allergies, preferred_foot, height, weight, house, jersey_number,
        health_status, injury_type, injury_date, injury_end_date
       FROM users WHERE id = $1 AND app_id = $2`,
      [req.userId, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', requireAuth, validate(updateProfileSchema), async (req, res) => {
  try {
    const {
      firstName, lastName, phoneNumber, emergencyContactName, emergencyContactPhone,
      medicalConditions, allergies, preferredFoot, height, weight
    } = req.body;
    
    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone_number = COALESCE($3, phone_number),
        emergency_contact_name = COALESCE($4, emergency_contact_name),
        emergency_contact_phone = COALESCE($5, emergency_contact_phone),
        medical_conditions = COALESCE($6, medical_conditions),
        allergies = COALESCE($7, allergies),
        preferred_foot = COALESCE($8, preferred_foot),
        height = COALESCE($9, height),
        weight = COALESCE($10, weight),
        updated_at = NOW()
       WHERE id = $11 AND app_id = $12
       RETURNING *`,
      [firstName, lastName, phoneNumber, emergencyContactName, emergencyContactPhone,
       medicalConditions, allergies, preferredFoot, height, weight, req.userId, req.appCtx.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
