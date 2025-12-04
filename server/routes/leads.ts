import { Router, Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { logger } from "../utils/logger.js";

const router = Router();

const LeadSchema = z.object({
  role: z.enum(['Player', 'Coach', 'Parent']),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  age: z.string().optional(),
  gradYear: z.string().optional(),
  goals: z.array(z.string()).optional(),
  currentLevel: z.string().optional(),
  budgetPreference: z.string().optional(),
  gapYearInterest: z.boolean().optional(),
  source: z.string().optional().default('pathways'),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const validationResult = LeadSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid form data",
        details: validationResult.error.flatten().fieldErrors
      });
    }

    const data = validationResult.data;

    const result = await pool.query(
      `INSERT INTO pathway_leads (role, name, email, age, grad_year, goals, current_level, budget_preference, gap_year_interest, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, created_at`,
      [
        data.role,
        data.name,
        data.email,
        data.age || null,
        data.gradYear || null,
        data.goals ? JSON.stringify(data.goals) : null,
        data.currentLevel || null,
        data.budgetPreference || null,
        data.gapYearInterest || false,
        data.source || 'pathways'
      ]
    );

    logger.info("New pathway lead captured", { 
      id: result.rows[0].id,
      role: data.role,
      email: data.email
    });

    res.status(201).json({
      success: true,
      message: "Thank you! We'll be in touch soon.",
      leadId: result.rows[0].id
    });

  } catch (error) {
    logger.error("Failed to save lead", { error });
    res.status(500).json({
      success: false,
      error: "Failed to submit form. Please try again."
    });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, role, limit = 50, offset = 0 } = req.query;
    
    let query = `SELECT * FROM pathway_leads WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM pathway_leads`
    );

    res.json({
      success: true,
      leads: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: Number(limit),
      offset: Number(offset)
    });

  } catch (error) {
    logger.error("Failed to fetch leads", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch leads"
    });
  }
});

router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'qualified', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: " + validStatuses.join(', ')
      });
    }

    const result = await pool.query(
      `UPDATE pathway_leads SET status = $1, notes = COALESCE($2, notes) WHERE id = $3 RETURNING *`,
      [status, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Lead not found"
      });
    }

    logger.info("Lead status updated", { id, status });

    res.json({
      success: true,
      lead: result.rows[0]
    });

  } catch (error) {
    logger.error("Failed to update lead status", { error });
    res.status(500).json({
      success: false,
      error: "Failed to update lead"
    });
  }
});

export default router;
