import express from 'express';
import { db } from '../db';
import { apps } from '../app-registry.schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { logger } from '../utils/logger';

const router = express.Router();
const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

/**
 * Generate a secure random API key
 */
function generateApiKey(): string {
  return `waru_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * GET /admin/apps - List all registered apps
 * Returns all apps with metadata (excluding API keys)
 */
router.get('/apps', async (_req, res) => {
  try {
    const allApps = await db.select({
      id: apps.id,
      name: apps.name,
      allowedOrigins: apps.allowedOrigins,
      rateLimitPerMin: apps.rateLimitPerMin,
      active: apps.active,
      createdAt: apps.createdAt,
    }).from(apps);

    res.json({
      success: true,
      count: allApps.length,
      apps: allApps.map(app => ({
        ...app,
        allowedOrigins: JSON.parse(app.allowedOrigins)
      }))
    });
  } catch (error) {
    logger.error('Failed to list apps', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve apps'
    });
  }
});

/**
 * POST /admin/apps - Create a new app
 * Body: { id, name, allowedOrigins[], rateLimitPerMin? }
 */
router.post('/apps', async (req, res) => {
  try {
    const { id, name, allowedOrigins, rateLimitPerMin } = req.body;

    if (!id || !name || !allowedOrigins) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, allowedOrigins'
      });
    }

    if (!Array.isArray(allowedOrigins)) {
      return res.status(400).json({
        success: false,
        error: 'allowedOrigins must be an array of strings'
      });
    }

    // Generate new API key
    const apiKey = generateApiKey();
    const apiKeyHash = sha256(apiKey);

    // Insert into database
    await db.insert(apps).values({
      id,
      name,
      apiKeyHash,
      allowedOrigins: JSON.stringify(allowedOrigins),
      rateLimitPerMin: rateLimitPerMin || 600,
      active: true
    });

    logger.info('New app created', { id, name });

    res.status(201).json({
      success: true,
      app: {
        id,
        name,
        allowedOrigins,
        rateLimitPerMin: rateLimitPerMin || 600
      },
      apiKey // Only returned once at creation
    });
  } catch (error: any) {
    logger.error('Failed to create app', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'App with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create app'
    });
  }
});

/**
 * PATCH /admin/apps/:id - Update app settings
 * Body: { name?, allowedOrigins?, rateLimitPerMin?, active? }
 */
router.patch('/apps/:id', async (req, res) => {
  try {
    const appId = req.params.id;
    const { name, allowedOrigins, rateLimitPerMin, active } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (allowedOrigins !== undefined) {
      if (!Array.isArray(allowedOrigins)) {
        return res.status(400).json({
          success: false,
          error: 'allowedOrigins must be an array'
        });
      }
      updates.allowedOrigins = JSON.stringify(allowedOrigins);
    }
    if (rateLimitPerMin !== undefined) updates.rateLimitPerMin = rateLimitPerMin;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const result = await db
      .update(apps)
      .set(updates)
      .where(eq(apps.id, appId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }

    logger.info('App updated', { id: appId, updates: Object.keys(updates) });

    res.json({
      success: true,
      app: result[0]
    });
  } catch (error) {
    logger.error('Failed to update app', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update app'
    });
  }
});

/**
 * POST /admin/apps/:id/regenerate-key - Regenerate API key for an app
 * SECURITY: This invalidates the old key immediately
 */
router.post('/apps/:id/regenerate-key', async (req, res) => {
  try {
    const appId = req.params.id;
    
    // Generate new key
    const apiKey = generateApiKey();
    const apiKeyHash = sha256(apiKey);

    const result = await db
      .update(apps)
      .set({ apiKeyHash })
      .where(eq(apps.id, appId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }

    logger.warn('API key regenerated', { id: appId });

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey // Only shown once
    });
  } catch (error) {
    logger.error('Failed to regenerate key', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate API key'
    });
  }
});

/**
 * DELETE /admin/apps/:id - Delete an app
 * SECURITY: This is permanent and cannot be undone
 */
router.delete('/apps/:id', async (req, res) => {
  try {
    const appId = req.params.id;

    const result = await db
      .delete(apps)
      .where(eq(apps.id, appId))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }

    logger.warn('App deleted', { id: appId });

    res.json({
      success: true,
      message: 'App deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete app', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete app'
    });
  }
});

export default router;
