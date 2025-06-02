import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, updatePlayerSchema, insertChoreSchema, updateChoreSchema, insertFoodOrderSchema, updateFoodOrderSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');

    // Check if user is authenticated or has dev session
    console.log('Auth check - isAuthenticated:', req.isAuthenticated());
    console.log('Auth check - session exists:', !!req.session);
    console.log('Auth check - session ID:', req.sessionID);
    console.log('Auth check - session.devLoggedIn:', req.session?.devLoggedIn);
    
    const isAuthenticated = req.isAuthenticated() || req.session?.devLoggedIn;
    
    if (!isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Check if user data is stored in session
      if (req.session?.userData) {
        console.log('Returning session user data:', req.session.userData);
        res.json(req.session.userData);
        return;
      }
      
      // Check if authenticated via OpenID Connect
      const userId = req.user?.claims?.sub;
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          res.json(user);
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } else {
        // Fallback for development
        res.json({
          id: "test-admin",
          email: "admin@warubi-sports.com",
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          profileImageUrl: null
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Login endpoint with form data
  app.post('/api/auth/login', async (req: any, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    console.log('Login attempt with:', { email, firstName, lastName });
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Determine user role based on email domain
    const isAdmin = email.endsWith('@fckoeln.de') || email.endsWith('@warubi-sports.com');
    const role = isAdmin ? 'admin' : 'player';
    
    // Create user session
    const userData = {
      id: isAdmin ? 'admin-user' : 'player-user',
      email,
      firstName,
      lastName,
      role,
      profileImageUrl: null
    };
    
    // Create a mock authenticated user for the session
    const mockUser = {
      claims: {
        sub: userData.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName
      }
    };
    
    // Store user data in session
    if (req.session) {
      req.session.userData = userData;
      req.session.devLoggedIn = true;
      
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Also authenticate with Passport
        req.logIn(mockUser, (loginErr: any) => {
          if (loginErr) {
            console.log('Passport login warning:', loginErr);
          }
          console.log('Login successful for:', email, 'Role:', role);
          res.json({ message: "Login successful", user: userData });
        });
      });
    } else {
      res.status(500).json({ message: "Session not available" });
    }
  });

  // Admin routes for user management
  app.get('/api/admin/pending-users', isAdmin, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.put('/api/admin/approve-user/:userId', isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.approveUser(userId);
      res.json({ message: "User approved successfully" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  // Get all players (requires authentication)
  app.get("/api/players", isAuthenticated, async (req, res) => {
    try {
      const { search, position, ageGroup, nationality, status } = req.query;
      
      let players;
      
      if (search) {
        players = await storage.searchPlayers(search as string);
      } else if (position || ageGroup || nationality || status) {
        players = await storage.filterPlayers({
          position: position as string,
          ageGroup: ageGroup as string,
          nationality: nationality as string,
          status: status as string,
        });
      } else {
        players = await storage.getAllPlayers();
      }
      
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Get player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  // Create new player
  app.post("/api/players", async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create player" });
    }
  });

  // Update player
  app.put("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updatePlayerSchema.parse(req.body);
      
      const updatedPlayer = await storage.updatePlayer(id, validatedData);
      
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json(updatedPlayer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update player" });
    }
  });

  // Delete player
  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlayer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  // Get player statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlayerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Export players data
  app.get("/api/players/export", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      
      // Convert to CSV format
      const headers = [
        "ID", "First Name", "Last Name", "Email", "Date of Birth", 
        "Nationality", "Position", "Age Group", "Status", "Notes"
      ];
      
      const csvData = [
        headers.join(","),
        ...players.map(player => [
          player.id,
          `"${player.firstName}"`,
          `"${player.lastName}"`,
          `"${player.email}"`,
          `"${player.dateOfBirth}"`,
          `"${player.nationality}"`,
          `"${player.position}"`,
          `"${player.ageGroup}"`,
          `"${player.status}"`,
          `"${player.notes || ""}"`
        ].join(","))
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=players.csv");
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export player data" });
    }
  });

  // Chore routes
  // Get all chores
  app.get("/api/chores", async (req, res) => {
    try {
      const house = req.query.house as string;
      const chores = house 
        ? await storage.getChoresByHouse(house)
        : await storage.getAllChores();
      res.json(chores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chores" });
    }
  });

  // Get chore by ID
  app.get("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chore = await storage.getChore(id);
      
      if (!chore) {
        return res.status(404).json({ message: "Chore not found" });
      }
      
      res.json(chore);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chore" });
    }
  });

  // Create new chore
  app.post("/api/chores", async (req, res) => {
    try {
      const validatedData = insertChoreSchema.parse(req.body);
      const chore = await storage.createChore(validatedData);
      res.status(201).json(chore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create chore" });
    }
  });

  // Update chore
  app.put("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateChoreSchema.parse(req.body);
      
      const updatedChore = await storage.updateChore(id, validatedData);
      
      if (!updatedChore) {
        return res.status(404).json({ message: "Chore not found" });
      }
      
      res.json(updatedChore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update chore" });
    }
  });

  // Delete chore
  app.delete("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChore(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Chore not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chore" });
    }
  });

  // Get chore statistics  
  app.get("/api/chore-stats", async (req, res) => {
    try {
      const stats = await storage.getChoreStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chore statistics" });
    }
  });

  // Practice excuse routes (simplified in-memory system)
  let practiceExcuses: any[] = [
    {
      id: 1,
      playerName: "Max Mueller",
      date: "2024-06-03",
      reason: "Medical appointment - dentist visit scheduled weeks ago",
      status: "approved",
      submittedAt: "2024-06-01T10:00:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-01T14:00:00Z"
    },
    {
      id: 2,
      playerName: "Hans Weber", 
      date: "2024-06-05",
      reason: "Family emergency - grandmother hospitalized",
      status: "approved",
      submittedAt: "2024-06-04T08:30:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-04T09:00:00Z"
    },
    {
      id: 3,
      playerName: "Erik Fischer",
      date: "2024-06-07", 
      reason: "Want to sleep in",
      status: "denied",
      submittedAt: "2024-06-06T23:45:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-07T07:00:00Z",
      notes: "Insufficient reason. All players must attend regular training."
    },
    {
      id: 4,
      playerName: "Jan Richter",
      date: "2024-06-10",
      reason: "University exam that cannot be rescheduled", 
      status: "pending",
      submittedAt: "2024-06-08T16:20:00Z"
    }
  ];
  let nextExcuseId = 5;

  function categorizeReason(reason: string): string {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('medical') || lowerReason.includes('doctor') || lowerReason.includes('dentist') || lowerReason.includes('hospital')) {
      return 'Medical';
    }
    if (lowerReason.includes('family') || lowerReason.includes('emergency')) {
      return 'Family Emergency';
    }
    if (lowerReason.includes('exam') || lowerReason.includes('university') || lowerReason.includes('school')) {
      return 'Academic';
    }
    if (lowerReason.includes('injury') || lowerReason.includes('hurt') || lowerReason.includes('pain')) {
      return 'Injury';
    }
    return 'Other';
  }

  app.get("/api/practice-excuses", (req, res) => {
    res.json(practiceExcuses.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ));
  });

  app.post("/api/practice-excuses", (req, res) => {
    const { playerName, date, reason } = req.body;
    
    if (!playerName || !date || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (reason.length < 10) {
      return res.status(400).json({ error: "Reason must be at least 10 characters" });
    }

    const newExcuse = {
      id: nextExcuseId++,
      playerName,
      date,
      reason,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    
    practiceExcuses.push(newExcuse);
    res.status(201).json(newExcuse);
  });

  app.get("/api/practice-excuse-stats", (req, res) => {
    const stats = practiceExcuses.reduce((acc, excuse) => {
      acc.totalExcuses++;
      if (excuse.status === "pending") acc.pendingExcuses++;
      if (excuse.status === "approved") acc.approvedExcuses++;
      if (excuse.status === "denied") acc.deniedExcuses++;

      const reasonCategory = categorizeReason(excuse.reason);
      acc.excusesByReason[reasonCategory] = (acc.excusesByReason[reasonCategory] || 0) + 1;

      return acc;
    }, {
      totalExcuses: 0,
      pendingExcuses: 0,
      approvedExcuses: 0,
      deniedExcuses: 0,
      excusesByReason: {} as Record<string, number>
    });

    res.json(stats);
  });

  // Food order routes
  app.get("/api/food-orders", async (req, res) => {
    try {
      const orders = await storage.getAllFoodOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching food orders:", error);
      res.status(500).json({ message: "Failed to fetch food orders" });
    }
  });

  app.post("/api/food-orders", async (req, res) => {
    try {
      const validatedData = insertFoodOrderSchema.parse(req.body);
      const order = await storage.createFoodOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating food order:", error);
        res.status(500).json({ message: "Failed to create food order" });
      }
    }
  });

  app.get("/api/food-order-stats", async (req, res) => {
    try {
      const stats = await storage.getFoodOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching food order stats:", error);
      res.status(500).json({ message: "Failed to fetch food order stats" });
    }
  });

  app.put("/api/food-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateFoodOrderSchema.parse(req.body);
      const order = await storage.updateFoodOrder(id, validatedData);
      if (!order) {
        res.status(404).json({ message: "Food order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating food order:", error);
        res.status(500).json({ message: "Failed to update food order" });
      }
    }
  });

  // Communication routes
  app.get('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const messageData = req.body;
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.patch('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Event routes (admin-only)
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        createdBy: "Admin User",
      };

      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateEvent(id, req.body);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.get("/api/events/date/:date", isAuthenticated, async (req, res) => {
    try {
      const date = req.params.date;
      const events = await storage.getEventsByDate(date);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events by date:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
