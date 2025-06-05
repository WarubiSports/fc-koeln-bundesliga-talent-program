import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, updatePlayerSchema, insertChoreSchema, updateChoreSchema, insertFoodOrderSchema, updateFoodOrderSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { simpleAuth, simpleAdminAuth, createUserToken, getUserFromToken, removeUserToken } from "./auth-simple";
import { devAuth } from "./auth-bypass";



export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Database initialization complete
  console.log("Database storage initialized successfully");
  
  // Admin account created via SQL: max.bisinger@warubi-sports / ITP2024
  console.log("Admin account available: max.bisinger@warubi-sports");





  // Development login bypass
  app.post('/api/auth/dev-login', async (req: any, res) => {
    // Set development session data for admin access
    (req.session as any).devLoggedIn = true;
    (req.session as any).userData = {
      id: 'dev-admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@fckoeln.dev',
      role: 'admin',
      status: 'approved'
    };
    
    res.json({ message: 'Development login successful', user: (req.session as any).userData });
  });

  // Development logout endpoint
  app.post('/api/auth/dev-logout', async (req: any, res) => {
    // Destroy the entire session to ensure clean logout
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
        res.status(500).json({ message: 'Logout failed' });
        return;
      }
      // Clear the cookie as well
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Simple logout endpoint
  app.post('/api/auth/simple-logout', async (req: any, res) => {
    // Destroy the entire session to ensure clean logout
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
        res.status(500).json({ message: 'Logout failed' });
        return;
      }
      // Clear the cookie as well
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Simple login endpoint for multiple users
  app.post('/api/auth/simple-login', async (req: any, res) => {
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;
    
    console.log('Parsed credentials:', { loginIdentifier, password });
    console.log('Login identifier type:', typeof loginIdentifier);
    console.log('Password type:', typeof password);
    
    // Simple credential validation - you can modify these as needed
    const validCredentials = [
      { username: 'max.bisinger@warubi-sports.com', password: 'ITP2024', role: 'admin', name: 'Max Bisinger' },
      { username: 'max.bisinger@warubi-sports', password: 'ITP2024', role: 'admin', name: 'Max Bisinger' },
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
      { username: 'coach', password: 'coach123', role: 'coach', name: 'Coach' },
      { username: 'staff', password: 'staff123', role: 'staff', name: 'Staff Member' },
      { username: 'manager', password: 'manager123', role: 'manager', name: 'Team Manager' }
    ];
    
    console.log('Available credentials:', validCredentials.map(c => ({ username: c.username, password: c.password })));
    
    // First check hardcoded credentials
    let user = validCredentials.find(u => u.username === loginIdentifier && u.password === password);
    
    // If not found in hardcoded credentials, check approved users in database
    if (!user) {
      try {
        const dbUser = await storage.getUserByUsername(loginIdentifier);
        console.log('Database user found:', dbUser);
        
        if (dbUser && dbUser.status === 'approved' && dbUser.password === password) {
          const userEmail = dbUser.email || loginIdentifier;
          user = {
            username: userEmail,
            password: dbUser.password || '',
            role: dbUser.role || 'player',
            name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim()
          };
          console.log('Database user authenticated:', user);
        }
      } catch (error) {
        console.error('Error checking database user:', error);
      }
    }
    
    if (!user) {
      console.log('No matching user found for:', { loginIdentifier, password });
      console.log('Exact match check:', validCredentials.map(c => ({
        username: c.username,
        usernameMatch: c.username === loginIdentifier,
        password: c.password, 
        passwordMatch: c.password === password
      })));
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const userData = {
      id: user.username,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1] || '',
      email: user.username.includes('@') ? user.username : `${user.username}@fckoeln.dev`,
      role: user.role,
      status: 'approved'
    };
    
    // Create a simple token and store user data
    const token = createUserToken(userData);
    
    console.log('Login successful - token created:', token);
    
    res.json({ 
      message: 'Login successful', 
      user: userData,
      token: token
    });
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      console.log('Registration request received:', req.body);
      
      const { 
        password, 
        firstName, 
        lastName, 
        email, 
        dateOfBirth, 
        nationality, 
        nationalityCode,
        positions, 
        role, 
        house, 
        phoneNumber, 
        emergencyContact, 
        emergencyPhone,
        profileImageUrl 
      } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if email already exists
      try {
        const existingUser = await storage.getUserByUsername(email);
        if (existingUser) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      } catch (error) {
        console.log('User does not exist, proceeding with registration');
      }

      // Create user with pending status
      const userData = {
        id: email,
        username: email,
        password: password, // In production, this should be hashed
        firstName: firstName,
        lastName: lastName,
        email: email,
        dateOfBirth: dateOfBirth || null,
        nationality: nationality || null,
        nationalityCode: nationalityCode || null,
        position: Array.isArray(positions) ? positions.join(', ') : (positions || null),
        role: role,
        house: house || null,
        phoneNumber: phoneNumber || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        status: 'pending',
        profileImageUrl: profileImageUrl || null
      };

      console.log('Creating user with data:', userData);
      
      const newUser = await storage.createUser(userData);

      console.log('User created successfully:', newUser);

      res.status(201).json({ 
        message: 'Registration successful. Your account is pending approval.',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      });
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  });

  // Clear logout flag endpoint (for testing landing page)
  app.post('/api/auth/clear-logout', async (req: any, res) => {
    delete (req.session as any).loggedOut;
    res.json({ message: 'Logout flag cleared' });
  });

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
    console.log('Auth check - session.simpleAuth:', (req.session as any)?.simpleAuth);
    console.log('Auth check - session.devLoggedIn:', (req.session as any)?.devLoggedIn);
    console.log('Auth check - session.userData:', !!(req.session as any)?.userData);
    console.log('Auth check - session.loggedOut:', req.session?.loggedOut);
    console.log('Auth check - full session:', req.session);

    try {
      // Check for Bearer token in Authorization header first
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const userData = getUserFromToken(token);
        
        if (userData) {
          console.log('Token auth successful for user:', userData.id);
          res.json(userData);
          return;
        }
      }

      // Check if user explicitly logged out first
      if ((req.session as any)?.loggedOut) {
        console.log('User explicitly logged out, returning 401');
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Check if user is authenticated via simple auth (session fallback)
      if ((req.session as any)?.simpleAuth && (req.session as any)?.userData) {
        console.log('Returning simple auth user data:', (req.session as any).userData);
        res.json((req.session as any).userData);
        return;
      }

      // Check if user data is stored in session AND devLoggedIn flag is set
      if ((req.session as any)?.devLoggedIn && (req.session as any)?.userData) {
        console.log('Returning session user data:', (req.session as any).userData);
        res.json((req.session as any).userData);
        return;
      }
      
      // Check if authenticated via simple auth (Bearer token)
      if (req.user) {
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        if (user) {
          res.json(user);
        } else {
          // Return the user data from login if not in database yet
          res.json(req.user);
        }
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
        // No authenticated user found
        res.status(401).json({ message: "Unauthorized" });
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
    
    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create or update user in database
    const userData = {
      id: userId,
      username: email, // Use email as username for compatibility
      password: 'oauth_placeholder', // OAuth users don't have passwords
      email,
      firstName,
      lastName,
      role,
      status: isAdmin ? 'approved' : 'pending',
      profileImageUrl: null
    };
    
    // Upsert user in database
    await storage.upsertUser(userData);
    
    // Create authentication token
    const token = createUserToken(userData);
    
    console.log('Login successful for:', email, 'Role:', role, 'Token:', token);
    res.json({ 
      message: "Login successful", 
      user: userData,
      token: token
    });
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Profile completion endpoint
  app.post('/api/complete-profile', simpleAuth, async (req: any, res) => {
    try {
      const { dateOfBirth, nationality, position } = req.body;
      const userId = req.user.id;

      if (!dateOfBirth || !nationality || !position) {
        return res.status(400).json({ message: "All profile fields are required" });
      }

      await storage.updateUserProfile(userId, {
        dateOfBirth,
        nationality,
        position
      });

      res.json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  // Admin routes for user management
  app.get('/api/admin/pending-users', simpleAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });

  app.post('/api/admin/approve-user/:userId', simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.approveUser(userId);
      res.json({ message: "User approved successfully" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post('/api/admin/reject-user/:userId', simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get('/api/admin/user-stats', simpleAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const players = await storage.getAllPlayers();
      
      const stats = {
        totalUsers: allUsers.length,
        pendingUsers: allUsers.filter((u: any) => u.status === 'pending').length,
        approvedUsers: allUsers.filter((u: any) => u.status === 'approved').length,
        activePlayers: players.filter(p => p.status === 'active').length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Get all approved users and players for deletion management
  app.get('/api/admin/approved-users', simpleAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const approvedUsers = allUsers.filter((u: any) => u.status === 'approved');
      res.json(approvedUsers);
    } catch (error) {
      console.error("Error fetching approved users:", error);
      res.status(500).json({ message: "Failed to fetch approved users" });
    }
  });

  // Admin deletion endpoints - only for Max Bisinger
  app.delete('/api/admin/delete-user/:userId', simpleAdminAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const adminUser = req.user;
      
      // Only allow Max Bisinger to delete users
      const userEmail = adminUser?.userData?.email || adminUser?.email || adminUser?.id;
      if (userEmail !== 'max.bisinger@warubi-sports.com@fckoeln.dev' && userEmail !== 'max.bisinger@warubi-sports.com') {
        return res.status(403).json({ message: "Only Max Bisinger can delete users" });
      }
      
      // Prevent self-deletion
      if (userId === adminUser?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete('/api/admin/delete-player/:playerId', simpleAdminAuth, async (req: any, res) => {
    try {
      const { playerId } = req.params;
      const adminUser = req.user;
      
      // Only allow Max Bisinger to delete players
      const userEmail = adminUser?.userData?.email || adminUser?.email || adminUser?.id;
      if (userEmail !== 'max.bisinger@warubi-sports.com@fckoeln.dev' && userEmail !== 'max.bisinger@warubi-sports.com') {
        return res.status(403).json({ message: "Only Max Bisinger can delete players" });
      }
      
      const deleted = await storage.deletePlayer(parseInt(playerId));
      if (!deleted) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });

  app.delete('/api/admin/reject-user/:userId', simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  // Profile completion endpoint
  app.post('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const { dateOfBirth, nationality, position } = req.body;
      const userId = req.user.claims.sub;

      // Update user profile with additional information
      await storage.updateUserProfile(userId, {
        dateOfBirth,
        nationality,
        position
      });

      res.json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });
  // Get all players
  app.get("/api/players", async (req, res) => {
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

  // Player registration endpoint (public)
  app.post("/api/players/register", async (req, res) => {
    try {
      const { 
        firstName, lastName, email, password, phone, dateOfBirth, 
        nationality, nationalityCode, position, positions, preferredFoot,
        height, weight, jerseyNumber, previousClub, profileImageUrl,
        emergencyContactName, emergencyContactPhone, medicalConditions, allergies
      } = req.body;

      // Calculate age from date of birth
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Create player data with default status and house assignment
      const playerData = {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        age,
        nationality,
        nationalityCode,
        position,
        positions,
        preferredFoot: preferredFoot || "right",
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : undefined,
        previousClub,
        profileImageUrl,
        emergencyContactName,
        emergencyContactPhone,
        medicalConditions,
        allergies,
        status: "pending", // Default status for new registrations
        house: null, // Admin will assign house later
        availability: "available",
        availabilityReason: null
      };

      const validatedData = insertPlayerSchema.parse(playerData);
      const player = await storage.createPlayer(validatedData);
      
      res.status(201).json({ 
        message: "Registration submitted successfully. Your profile is pending approval.",
        player: player 
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to register player" });
    }
  });

  // Create new player (admin only)
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
          `"${player.age || ""}"`,
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
      
      // Server-side budget validation
      const estimatedCost = parseFloat(validatedData.estimatedCost || "0");
      if (estimatedCost > 35) {
        return res.status(400).json({ 
          message: "Order exceeds budget limit of €35.00",
          currentCost: estimatedCost 
        });
      }
      
      // Check for duplicate orders (same player, same week)
      const existingOrders = await storage.getFoodOrdersByPlayer(validatedData.playerName);
      const duplicateOrder = existingOrders.find(order => 
        order.weekStartDate === validatedData.weekStartDate && 
        order.deliveryDay === validatedData.deliveryDay &&
        order.status !== 'cancelled'
      );
      
      if (duplicateOrder) {
        return res.status(400).json({ 
          message: "Order already exists for this week and delivery day",
          existingOrderId: duplicateOrder.id 
        });
      }
      
      // Validate delivery date is not in the past
      const weekStart = new Date(validatedData.weekStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (weekStart < today) {
        return res.status(400).json({ 
          message: "Cannot place orders for past weeks" 
        });
      }
      
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

  app.get("/api/house-order-summary", async (req, res) => {
    try {
      const summary = await storage.getHouseOrderSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching house order summary:", error);
      res.status(500).json({ message: "Failed to fetch house order summary" });
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

  // Mark order as delivered/completed (admin/staff only)
  app.patch("/api/food-orders/:id/complete", simpleAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      
      // Check admin/staff permissions
      if (!userRole || !['admin', 'staff'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow completion of confirmed orders
      if (order.status !== 'confirmed') {
        return res.status(400).json({ 
          message: "Can only complete confirmed orders",
          currentStatus: order.status 
        });
      }
      
      // Extract delivery details from request body
      const {
        deliveredItems = {},
        actualCost,
        deliveryNotes,
        storageLocation,
        receivedBy,
        itemCondition = 'good'
      } = req.body;

      // Create delivered order record
      const deliveredOrder = await storage.createDeliveredOrder({
        originalOrderId: order.id,
        playerName: order.playerName,
        weekStartDate: order.weekStartDate,
        deliveryDay: order.deliveryDay,
        
        // What was actually delivered
        deliveredProteins: deliveredItems.proteins || order.proteins,
        deliveredVegetables: deliveredItems.vegetables || order.vegetables,
        deliveredFruits: deliveredItems.fruits || order.fruits,
        deliveredGrains: deliveredItems.grains || order.grains,
        deliveredSnacks: deliveredItems.snacks || order.snacks,
        deliveredBeverages: deliveredItems.beverages || order.beverages,
        deliveredSupplements: deliveredItems.supplements || order.supplements,
        
        // Original order for comparison
        orderedProteins: order.proteins,
        orderedVegetables: order.vegetables,
        orderedFruits: order.fruits,
        orderedGrains: order.grains,
        orderedSnacks: order.snacks,
        orderedBeverages: order.beverages,
        orderedSupplements: order.supplements,
        
        actualCost: actualCost || order.estimatedCost,
        estimatedCost: order.estimatedCost,
        deliveryNotes: deliveryNotes || `Delivered by ${req.user?.firstName || 'staff'}`,
        storageLocation,
        deliveredBy: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Staff',
        receivedBy,
        itemCondition
      });

      // Update original order status
      const updatedOrder = await storage.updateFoodOrder(id, { 
        status: 'delivered',
        adminNotes: `Marked as delivered by ${req.user?.firstName || 'admin'} on ${new Date().toLocaleDateString()}. Stored in delivery record #${deliveredOrder.id}`
      });
      
      res.json({
        order: updatedOrder,
        deliveredOrder: deliveredOrder
      });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ message: "Failed to complete order" });
    }
  });

  // Mark order as confirmed (admin/staff only)
  app.patch("/api/food-orders/:id/confirm", simpleAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      
      // Check admin/staff permissions
      if (!userRole || !['admin', 'staff'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Only allow confirmation of pending orders
      if (order.status !== 'pending') {
        return res.status(400).json({ 
          message: "Can only confirm pending orders",
          currentStatus: order.status 
        });
      }
      
      const updatedOrder = await storage.updateFoodOrder(id, { 
        status: 'confirmed',
        adminNotes: `Confirmed by ${req.user?.firstName || 'admin'} on ${new Date().toLocaleDateString()}`
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });

  // Cancel order (admin/staff only)
  app.patch("/api/food-orders/:id/cancel", simpleAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      
      // Check admin/staff permissions
      if (!userRole || !['admin', 'staff'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Don't allow cancellation of already delivered orders
      if (order.status === 'delivered') {
        return res.status(400).json({ 
          message: "Cannot cancel delivered orders" 
        });
      }
      
      const { reason } = req.body;
      const updatedOrder = await storage.updateFoodOrder(id, { 
        status: 'cancelled',
        adminNotes: `Cancelled by ${req.user?.firstName || 'admin'} on ${new Date().toLocaleDateString()}${reason ? `. Reason: ${reason}` : ''}`
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Communication routes
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      console.log("Fetched", messages.length, "messages");
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      console.log("Creating message with data:", JSON.stringify(req.body, null, 2));
      const messageData = req.body;
      const message = await storage.createMessage(messageData);
      console.log("Created message:", JSON.stringify(message, null, 2));
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.patch('/api/messages/:id/read', async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Event routes - accessible to all authenticated users
  app.get("/api/events", async (req, res) => {
    try {
      console.log("Events API called by user:", req.user?.id || "unauthenticated");
      const events = await storage.getAllEvents();
      console.log("Found", events.length, "events");
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Event Templates routes
  app.get("/api/event-templates", async (req, res) => {
    try {
      const templates = await storage.getAllEventTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching event templates:", error);
      res.status(500).json({ message: "Failed to fetch event templates" });
    }
  });

  app.post("/api/event-templates", simpleAdminAuth, async (req: any, res) => {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user.id
      };
      const template = await storage.createEventTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating event template:", error);
      res.status(500).json({ message: "Failed to create event template" });
    }
  });

  app.delete("/api/event-templates/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEventTemplate(id);
      res.json({ message: "Event template deleted successfully" });
    } catch (error) {
      console.error("Error deleting event template:", error);
      res.status(500).json({ message: "Failed to delete event template" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", async (req: any, res) => {
    try {
      const userId = req.user?.id || 'dev-admin';
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Bulk operations routes
  app.patch("/api/events/bulk", simpleAdminAuth, async (req, res) => {
    try {
      const { eventIds, updates } = req.body;
      const events = await storage.bulkUpdateEvents(eventIds, updates);
      res.json(events);
    } catch (error) {
      console.error("Error bulk updating events:", error);
      res.status(500).json({ message: "Failed to bulk update events" });
    }
  });

  app.delete("/api/events/bulk", simpleAdminAuth, async (req, res) => {
    try {
      const { eventIds } = req.body;
      await storage.bulkDeleteEvents(eventIds);
      res.json({ message: "Events deleted successfully" });
    } catch (error) {
      console.error("Error bulk deleting events:", error);
      res.status(500).json({ message: "Failed to bulk delete events" });
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

  app.post("/api/events", devAuth, async (req: any, res) => {
    
    try {
      console.log('Original request body:', req.body);
      
      const baseEventData = {
        title: req.body.title,
        eventType: req.body.type || req.body.eventType,
        date: req.body.date,
        startTime: req.body.time || req.body.startTime,
        endTime: req.body.endTime || req.body.time,
        location: req.body.location,
        notes: req.body.description || req.body.notes,
        participants: req.body.participants,
        createdBy: "Admin User",
      };
      
      console.log('Mapped event data:', baseEventData);

      // Handle recurring events
      if (req.body.isRecurring && req.body.recurringPattern) {
        const events = [];
        const startDate = new Date(req.body.date);
        const endDate = req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
        
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const shouldCreateEvent = (() => {
            switch (req.body.recurringPattern) {
              case 'daily':
                return true;
              case 'weekdays':
                const dayOfWeek = currentDate.getDay();
                return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
              case 'weekly':
                return currentDate.getDay() === startDate.getDay();
              case 'monthly':
                return currentDate.getDate() === startDate.getDate();
              default:
                return false;
            }
          })();
          
          if (shouldCreateEvent) {
            const eventData = {
              ...baseEventData,
              date: currentDate.toISOString().split('T')[0],
              isRecurring: true,
              recurringPattern: req.body.recurringPattern
            };
            
            const event = await storage.createEvent(eventData);
            events.push(event);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`Created ${events.length} recurring events`);
        res.status(201).json({ message: `Created ${events.length} recurring events`, events });
      } else {
        // Single event
        const event = await storage.createEvent(baseEventData);
        res.status(201).json(event);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", devAuth, async (req: any, res) => {
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

  app.patch("/api/events/:id", devAuth, async (req: any, res) => {
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

  app.delete("/api/events/:id", async (req: any, res) => {
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
