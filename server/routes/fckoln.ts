import { Router } from 'express';
import { db } from '../db.js';
import { users, players, events, messages, chores, groceryOrders, applications, notifications } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger.js';

const router = Router();

// All routes here automatically have req.appCtx from the attachAppContext middleware
// app_id filtering will be applied to all database queries

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user in database for this app
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.appId, req.appCtx!.id)
      ))
      .limit(1);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Return user info (in production, would return JWT)
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const [existing] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.appId, req.appCtx!.id)
      ))
      .limit(1);

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        appId: req.appCtx!.id,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'player'
      })
      .returning();

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// ==========================================
// PLAYER MANAGEMENT ROUTES
// ==========================================

// Get all players
router.get('/players', async (req, res) => {
  try {
    const allPlayers = await db
      .select()
      .from(players)
      .where(eq(players.appId, req.appCtx!.id))
      .orderBy(desc(players.createdAt));

    res.json({
      success: true,
      players: allPlayers
    });
  } catch (error) {
    logger.error('Failed to fetch players', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch players' 
    });
  }
});

// Create player
router.post('/players', async (req, res) => {
  try {
    const { firstName, lastName, email, age, position, nationality, house, status } = req.body;

    const [newPlayer] = await db
      .insert(players)
      .values({
        appId: req.appCtx!.id,
        firstName,
        lastName,
        email,
        age,
        position,
        nationality,
        house,
        status: status || 'active'
      })
      .returning();

    res.status(201).json({
      success: true,
      player: newPlayer
    });
  } catch (error) {
    logger.error('Failed to create player', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create player' 
    });
  }
});

// Update player
router.patch('/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedPlayer] = await db
      .update(players)
      .set(updates)
      .where(and(
        eq(players.id, parseInt(id)),
        eq(players.appId, req.appCtx!.id)
      ))
      .returning();

    if (!updatedPlayer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    res.json({
      success: true,
      player: updatedPlayer
    });
  } catch (error) {
    logger.error('Failed to update player', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update player' 
    });
  }
});

// Delete player
router.delete('/players/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(players)
      .where(and(
        eq(players.id, parseInt(id)),
        eq(players.appId, req.appCtx!.id)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete player', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete player' 
    });
  }
});

// ==========================================
// EVENTS/CALENDAR ROUTES
// ==========================================

// Get all events
router.get('/events', async (req, res) => {
  try {
    const allEvents = await db
      .select()
      .from(events)
      .where(eq(events.appId, req.appCtx!.id))
      .orderBy(desc(events.startTime));

    res.json({
      success: true,
      events: allEvents
    });
  } catch (error) {
    logger.error('Failed to fetch events', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch events' 
    });
  }
});

// Create event
router.post('/events', async (req, res) => {
  try {
    const { title, type, location, description, startTime, endTime } = req.body;

    const [newEvent] = await db
      .insert(events)
      .values({
        appId: req.appCtx!.id,
        title,
        type,
        location,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null
      })
      .returning();

    res.status(201).json({
      success: true,
      event: newEvent
    });
  } catch (error) {
    logger.error('Failed to create event', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create event' 
    });
  }
});

// Update event
router.patch('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert date strings to Date objects if present
    if (updates.startTime) updates.startTime = new Date(updates.startTime);
    if (updates.endTime) updates.endTime = new Date(updates.endTime);

    const [updatedEvent] = await db
      .update(events)
      .set(updates)
      .where(and(
        eq(events.id, parseInt(id)),
        eq(events.appId, req.appCtx!.id)
      ))
      .returning();

    if (!updatedEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    logger.error('Failed to update event', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update event' 
    });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(events)
      .where(and(
        eq(events.id, parseInt(id)),
        eq(events.appId, req.appCtx!.id)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete event', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete event' 
    });
  }
});

// ==========================================
// MESSAGING ROUTES
// ==========================================

// Get messages
router.get('/messages', async (req, res) => {
  try {
    // Get messages from last 30 days only
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.appId, req.appCtx!.id))
      .orderBy(desc(messages.createdAt));

    res.json({
      success: true,
      messages: allMessages
    });
  } catch (error) {
    logger.error('Failed to fetch messages', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    const { senderId, recipientId, groupId, content } = req.body;

    const [newMessage] = await db
      .insert(messages)
      .values({
        appId: req.appCtx!.id,
        senderId,
        recipientId,
        groupId,
        content
      })
      .returning();

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    logger.error('Failed to send message', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
});

// ==========================================
// CHORES ROUTES
// ==========================================

// Get chores
router.get('/chores', async (req, res) => {
  try {
    const allChores = await db
      .select()
      .from(chores)
      .where(eq(chores.appId, req.appCtx!.id))
      .orderBy(desc(chores.createdAt));

    res.json({
      success: true,
      chores: allChores
    });
  } catch (error) {
    logger.error('Failed to fetch chores', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chores' 
    });
  }
});

// Create chore
router.post('/chores', async (req, res) => {
  try {
    const { title, description, assignedTo, house, priority, deadline } = req.body;

    const [newChore] = await db
      .insert(chores)
      .values({
        appId: req.appCtx!.id,
        title,
        description,
        assignedTo,
        house,
        priority: priority || 'medium',
        deadline: deadline ? new Date(deadline) : null,
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      success: true,
      chore: newChore
    });
  } catch (error) {
    logger.error('Failed to create chore', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chore' 
    });
  }
});

// Update chore
router.patch('/chores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    const [updatedChore] = await db
      .update(chores)
      .set(updates)
      .where(and(
        eq(chores.id, parseInt(id)),
        eq(chores.appId, req.appCtx!.id)
      ))
      .returning();

    if (!updatedChore) {
      return res.status(404).json({ 
        success: false, 
        message: 'Chore not found' 
      });
    }

    res.json({
      success: true,
      chore: updatedChore
    });
  } catch (error) {
    logger.error('Failed to update chore', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update chore' 
    });
  }
});

// ==========================================
// GROCERY ORDERS ROUTES
// ==========================================

// Get grocery orders
router.get('/grocery-orders', async (req, res) => {
  try {
    const orders = await db
      .select()
      .from(groceryOrders)
      .where(eq(groceryOrders.appId, req.appCtx!.id))
      .orderBy(desc(groceryOrders.createdAt));

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    logger.error('Failed to fetch grocery orders', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch grocery orders' 
    });
  }
});

// Create grocery order
router.post('/grocery-orders', async (req, res) => {
  try {
    const { playerId, items, totalAmount, deliveryDate } = req.body;

    const [newOrder] = await db
      .insert(groceryOrders)
      .values({
        appId: req.appCtx!.id,
        playerId,
        items: JSON.stringify(items),
        totalAmount,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    logger.error('Failed to create grocery order', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create grocery order' 
    });
  }
});

// ==========================================
// APPLICATIONS ROUTES
// ==========================================

// Get applications
router.get('/applications', async (req, res) => {
  try {
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.appId, req.appCtx!.id))
      .orderBy(desc(applications.createdAt));

    res.json({
      success: true,
      applications: apps
    });
  } catch (error) {
    logger.error('Failed to fetch applications', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications' 
    });
  }
});

// Create application
router.post('/applications', async (req, res) => {
  try {
    const { firstName, lastName, email, age, position, nationality, notes } = req.body;

    const [newApp] = await db
      .insert(applications)
      .values({
        appId: req.appCtx!.id,
        firstName,
        lastName,
        email,
        age,
        position,
        nationality,
        notes,
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      success: true,
      application: newApp
    });
  } catch (error) {
    logger.error('Failed to create application', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create application' 
    });
  }
});

// Update application status
router.patch('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await db
      .update(applications)
      .set({ status })
      .where(and(
        eq(applications.id, parseInt(id)),
        eq(applications.appId, req.appCtx!.id)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({
      success: true,
      application: updated
    });
  } catch (error) {
    logger.error('Failed to update application', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update application' 
    });
  }
});

export default router;
