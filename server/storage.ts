import {
  users,
  players,
  chores,
  excuses,
  practiceExcuses,
  groceryOrders,
  deliveredOrders,

  events,
  messages,
  notifications,
  eventTemplates,
  type User,
  type UpsertUser,
  type Player,
  type InsertPlayer,
  type UpdatePlayer,
  type Chore,
  type InsertChore,
  type UpdateChore,
  type Excuse,
  type InsertExcuse,
  type UpdateExcuse,
  type PracticeExcuse,
  type InsertPracticeExcuse,
  type UpdatePracticeExcuse,
  type GroceryOrder,
  type InsertGroceryOrder,
  type UpdateGroceryOrder,
  type FoodOrder,
  type InsertFoodOrder,
  type UpdateFoodOrder,
  type DeliveredOrder,
  type InsertDeliveredOrder,
  type UpdateDeliveredOrder,
  type Event,
  type InsertEvent,
  type UpdateEvent,
  type EventTemplate,
  type InsertEventTemplate,
  type UpdateEventTemplate,
  type Notification,
  type InsertNotification,
  type UpdateNotification,
  type Message,
  type InsertMessage,
  type UpdateMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql, desc, count, and, or, inArray, gte, lte, ne } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  approveUser(userId: string): Promise<void>;
  rejectUser(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  updateUserProfile(userId: string, profileData: any): Promise<User>;

  // Player methods
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined>;
  updatePlayerByEmail(email: string, updates: any): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  searchPlayers(query: string): Promise<Player[]>;
  filterPlayers(filters: {
    position?: string;
    ageGroup?: string;
    nationality?: string;
    status?: string;
  }): Promise<Player[]>;
  getPlayerStats(): Promise<{
    totalPlayers: number;
    countries: number;
  }>;

  // Chore methods
  getAllChores(): Promise<Chore[]>;
  getChore(id: number): Promise<Chore | undefined>;
  createChore(chore: InsertChore): Promise<Chore>;
  updateChore(id: number, updates: UpdateChore): Promise<Chore | undefined>;
  deleteChore(id: number): Promise<boolean>;
  getChoresByHouse(house: string): Promise<Chore[]>;
  getChoresForUser(username: string): Promise<Chore[]>;
  getChoresForUserByName(fullName: string): Promise<Chore[]>;
  getPlayersByHouse(house: string): Promise<Player[]>;
  getChoreStats(): Promise<{
    totalChores: number;
    pendingChores: number;
    completedChores: number;
    overdueChores: number;
  }>;

  // Excuse methods (generalized for any type of excuse)
  getAllExcuses(): Promise<Excuse[]>;
  getExcuse(id: number): Promise<Excuse | undefined>;
  createExcuse(excuse: InsertExcuse): Promise<Excuse>;
  updateExcuse(id: number, updates: UpdateExcuse): Promise<Excuse | undefined>;
  deleteExcuse(id: number): Promise<boolean>;
  getExcusesByPlayer(playerName: string): Promise<Excuse[]>;
  getExcusesByDate(date: string): Promise<Excuse[]>;
  getExcuseStats(): Promise<{
    totalExcuses: number;
    pendingExcuses: number;
    approvedExcuses: number;
    deniedExcuses: number;
    excusesByReason: Record<string, number>;
  }>;

  // Legacy methods for backward compatibility
  getAllPracticeExcuses(): Promise<PracticeExcuse[]>;
  getPracticeExcuse(id: number): Promise<PracticeExcuse | undefined>;
  createPracticeExcuse(excuse: InsertPracticeExcuse): Promise<PracticeExcuse>;
  updatePracticeExcuse(id: number, updates: UpdatePracticeExcuse): Promise<PracticeExcuse | undefined>;
  deletePracticeExcuse(id: number): Promise<boolean>;
  getPracticeExcusesByPlayer(playerName: string): Promise<PracticeExcuse[]>;
  getPracticeExcusesByDate(date: string): Promise<PracticeExcuse[]>;
  getPracticeExcuseStats(): Promise<{
    totalExcuses: number;
    pendingExcuses: number;
    approvedExcuses: number;
    deniedExcuses: number;
    excusesByReason: Record<string, number>;
  }>;

  // Food order methods
  getAllFoodOrders(): Promise<FoodOrder[]>;
  getFoodOrder(id: number): Promise<FoodOrder | undefined>;
  createFoodOrder(order: InsertFoodOrder): Promise<FoodOrder>;
  updateFoodOrder(id: number, updates: UpdateFoodOrder): Promise<FoodOrder | undefined>;
  deleteFoodOrder(id: number): Promise<boolean>;
  getFoodOrdersByPlayer(playerName: string): Promise<FoodOrder[]>;
  getFoodOrdersByDate(date: string): Promise<FoodOrder[]>;
  getFoodOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  }>;

  // House order summary methods
  getHouseOrderSummary(dateFilter?: string): Promise<{
    [house: string]: {
      totalOrders: number;
      players: string[];
      orderDetails: FoodOrder[];
      consolidatedItems: {
        proteins: string[];
        vegetables: string[];
        fruits: string[];
        grains: string[];
        snacks: string[];
        beverages: string[];
        supplements: string[];
      };
    };
  }>;

  // Event methods (admin-only)
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: UpdateEvent): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEventsByDate(date: string): Promise<Event[]>;
  getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]>;

  // Communication methods
  getAllMessages(): Promise<any[]>;
  getMessage(id: number): Promise<any | undefined>;
  createMessage(message: any): Promise<any>;
  updateMessage(id: number, updates: any): Promise<any | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  getMessagesByUser(userId: string): Promise<any[]>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Medical records methods (admin-only)
  getAllMedicalRecords(): Promise<any[]>;
  getMedicalRecord(id: number): Promise<any | undefined>;
  createMedicalRecord(record: any): Promise<any>;
  updateMedicalRecord(id: number, updates: any): Promise<any | undefined>;
  deleteMedicalRecord(id: number): Promise<boolean>;
  getMedicalRecordsByPlayer(playerId: number): Promise<any[]>;

  // Performance metrics methods
  getAllPerformanceMetrics(): Promise<any[]>;
  getPerformanceMetric(id: number): Promise<any | undefined>;
  createPerformanceMetric(metric: any): Promise<any>;
  updatePerformanceMetric(id: number, updates: any): Promise<any | undefined>;
  deletePerformanceMetric(id: number): Promise<boolean>;
  getPerformanceMetricsByPlayer(playerId: number): Promise<any[]>;

  // Document management methods (admin-only)
  getAllDocuments(): Promise<any[]>;
  getDocument(id: number): Promise<any | undefined>;
  createDocument(document: any): Promise<any>;
  updateDocument(id: number, updates: any): Promise<any | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getDocumentsByPlayer(playerId: number): Promise<any[]>;

  // Event Templates
  getAllEventTemplates(): Promise<EventTemplate[]>;
  getEventTemplate(id: number): Promise<EventTemplate | undefined>;
  createEventTemplate(template: InsertEventTemplate): Promise<EventTemplate>;
  updateEventTemplate(id: number, updates: UpdateEventTemplate): Promise<EventTemplate | undefined>;
  deleteEventTemplate(id: number): Promise<boolean>;
  getEventTemplatesByUser(userId: string): Promise<EventTemplate[]>;

  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: UpdateNotification): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Bulk operations
  bulkUpdateEvents(eventIds: number[], updates: UpdateEvent): Promise<Event[]>;
  bulkDeleteEvents(eventIds: number[]): Promise<boolean>;

  // Delivered orders storage methods
  getAllDeliveredOrders(): Promise<DeliveredOrder[]>;
  getDeliveredOrder(id: number): Promise<DeliveredOrder | undefined>;
  createDeliveredOrder(order: InsertDeliveredOrder): Promise<DeliveredOrder>;
  updateDeliveredOrder(id: number, updates: UpdateDeliveredOrder): Promise<DeliveredOrder | undefined>;
  deleteDeliveredOrder(id: number): Promise<boolean>;
  getDeliveredOrdersByPlayer(playerName: string): Promise<DeliveredOrder[]>;
  getDeliveredOrdersByDateRange(startDate: string, endDate: string): Promise<DeliveredOrder[]>;
  getDeliveredOrderStats(): Promise<{
    totalDeliveries: number;
    deliveriesThisWeek: number;
    deliveriesThisMonth: number;
    averageCost: number;
    topStorageLocations: string[];
  }>;

  // Recent activities
  getRecentActivities(): Promise<any[]>;

  // Password reset
  generatePasswordResetToken(email: string): Promise<string | null>;
  validatePasswordResetToken(token: string): Promise<User | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists by email
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email!)).limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      const [user] = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          status: userData.status || "pending",
          updatedAt: new Date(),
        })
        .where(eq(users.email, userData.email!))
        .returning();
      return user;
    } else {
      // Insert new user
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsersWithoutImages(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      dateOfBirth: users.dateOfBirth,
      nationality: users.nationality,
      nationalityCode: users.nationalityCode,
      position: users.position,
      role: users.role,
      status: users.status,
      house: users.house,
      phoneNumber: users.phoneNumber,
      emergencyContact: users.emergencyContact,
      emergencyPhone: users.emergencyPhone,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, "pending"));
  }

  async approveUser(userId: string): Promise<void> {
    // Get the user details first
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Approve the user
    await db
      .update(users)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Create player record automatically
    await this.syncUserToPlayer(user);
  }

  async rejectUser(userId: string): Promise<void> {
    // Get the user first to verify it exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Delete the user from the database
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    // Get the user first to verify it exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Also delete associated player record if it exists
    if (user.email) {
      await db
        .delete(players)
        .where(eq(players.email, user.email));
    }

    // Delete the user from the database
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, profileData: any): Promise<User> {
    // Filter out undefined values and prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Only include fields that are provided (not undefined)
    if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
    if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
    if (profileData.email !== undefined) updateData.email = profileData.email;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.phoneNumber !== undefined) updateData.phoneNumber = profileData.phoneNumber;
    if (profileData.dateOfBirth !== undefined) updateData.dateOfBirth = profileData.dateOfBirth;
    if (profileData.nationality !== undefined) updateData.nationality = profileData.nationality;
    if (profileData.nationalityCode !== undefined) updateData.nationalityCode = profileData.nationalityCode;
    if (profileData.position !== undefined) updateData.position = profileData.position;
    if (profileData.preferredFoot !== undefined) updateData.preferredFoot = profileData.preferredFoot;
    if (profileData.height !== undefined) updateData.height = profileData.height;
    if (profileData.weight !== undefined) updateData.weight = profileData.weight;
    if (profileData.previousClub !== undefined) updateData.previousClub = profileData.previousClub;
    if (profileData.profileImageUrl !== undefined) updateData.profileImageUrl = profileData.profileImageUrl;
    if (profileData.emergencyContactName !== undefined) updateData.emergencyContactName = profileData.emergencyContactName;
    if (profileData.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = profileData.emergencyContactPhone;
    if (profileData.medicalConditions !== undefined) updateData.medicalConditions = profileData.medicalConditions;
    if (profileData.allergies !== undefined) updateData.allergies = profileData.allergies;
    if (profileData.house !== undefined) updateData.house = profileData.house;
    if (profileData.role !== undefined) updateData.role = profileData.role;

    // Update the user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  // Helper method to sync a user to player database
  private async syncUserToPlayer(user: User): Promise<void> {
    if (!user.email || user.role === "admin") return; // Skip admins

    // Check if player already exists
    const [existingPlayer] = await db
      .select()
      .from(players)
      .where(eq(players.email, user.email));

    // Create player record if it doesn't exist (only for non-admin users)
    if (!existingPlayer && user.role === "player") {
      await db.insert(players).values({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        dateOfBirth: user.dateOfBirth || "1995-01-01",
        nationality: user.nationality || "Germany",
        position: user.position || "Midfielder",
        status: "active",
        profileImageUrl: user.profileImageUrl,
        notes: "Auto-created from approved user account"
      });
    }
  }

  // Sync all approved users to player database
  async syncAllApprovedUsersToPlayers(): Promise<void> {
    const approvedUsers = await db
      .select()
      .from(users)
      .where(eq(users.status, "approved"));

    for (const user of approvedUsers) {
      await this.syncUserToPlayer(user);
    }
  }

  // Player methods
  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async updatePlayerByEmail(email: string, updates: any): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.email, email))
      .returning();
    return player || undefined;
  }

  async deletePlayer(id: number): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(
        sql`${players.firstName} ILIKE ${`%${query}%`} OR 
            ${players.lastName} ILIKE ${`%${query}%`} OR 
            ${players.email} ILIKE ${`%${query}%`}`
      );
  }

  async filterPlayers(filters: {
    position?: string;
    ageGroup?: string;
    nationality?: string;
    status?: string;
  }): Promise<Player[]> {
    const conditions = [];
    
    if (filters.position) {
      conditions.push(eq(players.position, filters.position));
    }
    if (filters.nationality) {
      conditions.push(eq(players.nationality, filters.nationality));
    }
    if (filters.status) {
      conditions.push(eq(players.status, filters.status));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(players);
    }
    
    return await db.select().from(players).where(and(...conditions));
  }

  async getPlayersByHouse(house: string): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.house, house));
  }

  async getPlayerStats(): Promise<{ totalPlayers: number; countries: number }> {
    const allPlayers = await db.select().from(players);
    const uniqueCountries = new Set(allPlayers.map(p => p.nationality));
    
    return {
      totalPlayers: allPlayers.length,
      countries: uniqueCountries.size,
    };
  }

  // Chore methods
  async getAllChores(): Promise<Chore[]> {
    return await db.select().from(chores);
  }

  async getChore(id: number): Promise<Chore | undefined> {
    const [chore] = await db.select().from(chores).where(eq(chores.id, id));
    return chore || undefined;
  }

  async createChore(insertChore: InsertChore): Promise<Chore> {
    // Enhanced validation
    if (!insertChore.title?.trim()) {
      throw new Error('Chore title is required');
    }
    
    if (!insertChore.createdBy?.trim()) {
      throw new Error('Creator is required');
    }

    // Validate house assignment
    const validHouses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
    if (!validHouses.includes(insertChore.house)) {
      throw new Error(`Invalid house. Must be one of: ${validHouses.join(', ')}`);
    }

    // Validate assigned players exist in the specified house
    if (insertChore.assignedTo) {
      try {
        const assignedPlayers = JSON.parse(insertChore.assignedTo);
        if (Array.isArray(assignedPlayers) && assignedPlayers.length > 0) {
          const housePlayers = await this.getAllPlayers();
          const validPlayers = housePlayers
            .filter(player => player.house === insertChore.house)
            .map(player => `${player.firstName} ${player.lastName}`);
          
          const invalidAssignments = assignedPlayers.filter(player => 
            !validPlayers.includes(player)
          );
          
          if (invalidAssignments.length > 0) {
            throw new Error(`Invalid player assignments for ${insertChore.house}: ${invalidAssignments.join(', ')}`);
          }
        }
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error('Invalid assignedTo format. Must be valid JSON array');
        }
        throw parseError;
      }
    }

    // Validate due date format if provided
    if (insertChore.dueDate) {
      const dueDate = new Date(insertChore.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date format');
      }
    }

    try {
      const [chore] = await db
        .insert(chores)
        .values({
          ...insertChore,
          createdAt: new Date(),
        })
        .returning();
      
      // Create notifications for assigned players
      if (chore.assignedTo) {
        await this.createNotificationsForAssignees(
          chore.assignedTo,
          `New Chore Assigned: ${chore.title}`,
          `You have been assigned a new chore in ${chore.house}. Due: ${chore.dueDate}`,
          'chore',
          '/chores'
        );
      }
      
      return chore;
    } catch (error) {
      console.error('Database error creating chore:', error);
      throw new Error('Failed to create chore due to database error');
    }
  }

  async updateChore(id: number, updates: UpdateChore): Promise<Chore | undefined> {
    const [chore] = await db
      .update(chores)
      .set(updates)
      .where(eq(chores.id, id))
      .returning();
    return chore || undefined;
  }

  async deleteChore(id: number): Promise<boolean> {
    const result = await db.delete(chores).where(eq(chores.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getChoresByHouse(house: string): Promise<Chore[]> {
    return await db.select().from(chores).where(eq(chores.house, house));
  }

  async getChoresForUser(username: string): Promise<Chore[]> {
    // Use exact matching for better precision
    return await db.select().from(chores).where(
      sql`${chores.assignedTo} = ${username}`
    );
  }

  async getChoresForUserByName(fullName: string): Promise<Chore[]> {
    // Separate method for full name matching
    return await db.select().from(chores).where(
      sql`${chores.assignedTo} = ${fullName}`
    );
  }

  async getChoreStats(): Promise<{
    totalChores: number;
    pendingChores: number;
    completedChores: number;
    overdueChores: number;
  }> {
    const total = await db.select({ count: sql<number>`count(*)` }).from(chores);
    const pending = await db.select({ count: sql<number>`count(*)` }).from(chores).where(eq(chores.status, 'pending'));
    const completed = await db.select({ count: sql<number>`count(*)` }).from(chores).where(eq(chores.status, 'completed'));
    
    return {
      totalChores: total[0]?.count || 0,
      pendingChores: pending[0]?.count || 0,
      completedChores: completed[0]?.count || 0,
      overdueChores: 0, // We'll implement this based on due dates later
    };
  }

  // Practice excuse methods
  async getAllPracticeExcuses(): Promise<PracticeExcuse[]> {
    return await db.select().from(practiceExcuses);
  }

  async getPracticeExcuse(id: number): Promise<PracticeExcuse | undefined> {
    const [excuse] = await db.select().from(practiceExcuses).where(eq(practiceExcuses.id, id));
    return excuse || undefined;
  }

  async createPracticeExcuse(insertExcuse: InsertPracticeExcuse): Promise<PracticeExcuse> {
    const excuseWithTimestamp = {
      ...insertExcuse,
      submittedAt: new Date().toISOString(),
    };
    
    const [excuse] = await db
      .insert(practiceExcuses)
      .values(excuseWithTimestamp)
      .returning();
    return excuse;
  }

  async updatePracticeExcuse(id: number, updates: UpdatePracticeExcuse): Promise<PracticeExcuse | undefined> {
    const [excuse] = await db
      .update(practiceExcuses)
      .set(updates)
      .where(eq(practiceExcuses.id, id))
      .returning();
    return excuse || undefined;
  }

  async deletePracticeExcuse(id: number): Promise<boolean> {
    const result = await db.delete(practiceExcuses).where(eq(practiceExcuses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getPracticeExcusesByPlayer(playerName: string): Promise<PracticeExcuse[]> {
    return await db.select().from(practiceExcuses).where(eq(practiceExcuses.playerName, playerName));
  }

  async getPracticeExcusesByDate(date: string): Promise<PracticeExcuse[]> {
    return await db.select().from(practiceExcuses).where(sql`submitted_at LIKE ${date + '%'}`);
  }

  // New generalized excuse methods
  async getAllExcuses(): Promise<Excuse[]> {
    const allExcuses = await db.select().from(excuses).orderBy(desc(excuses.submittedAt));
    return allExcuses;
  }

  async getExcuse(id: number): Promise<Excuse | undefined> {
    const [excuse] = await db.select().from(excuses).where(eq(excuses.id, id));
    return excuse;
  }

  async createExcuse(insertExcuse: InsertExcuse): Promise<Excuse> {
    const [excuse] = await db
      .insert(excuses)
      .values({
        ...insertExcuse,
        submittedAt: new Date().toISOString(),
      })
      .returning();
    return excuse;
  }

  async updateExcuse(id: number, updates: UpdateExcuse): Promise<Excuse | undefined> {
    const [excuse] = await db
      .update(excuses)
      .set(updates)
      .where(eq(excuses.id, id))
      .returning();
    return excuse;
  }

  async deleteExcuse(id: number): Promise<boolean> {
    const result = await db.delete(excuses).where(eq(excuses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getExcusesByPlayer(playerName: string): Promise<Excuse[]> {
    const playerExcuses = await db
      .select()
      .from(excuses)
      .where(eq(excuses.playerName, playerName))
      .orderBy(desc(excuses.submittedAt));
    return playerExcuses;
  }

  async getExcusesByDate(date: string): Promise<Excuse[]> {
    const dateExcuses = await db
      .select()
      .from(excuses)
      .where(sql`submitted_at LIKE ${date + '%'}`)
      .orderBy(desc(excuses.submittedAt));
    return dateExcuses;
  }

  async getExcuseStats(): Promise<{
    totalExcuses: number;
    pendingExcuses: number;
    approvedExcuses: number;
    deniedExcuses: number;
    excusesByReason: Record<string, number>;
  }> {
    const total = await db.select({ count: sql<number>`count(*)` }).from(excuses);
    const pending = await db.select({ count: sql<number>`count(*)` }).from(excuses).where(eq(excuses.status, 'pending'));
    const approved = await db.select({ count: sql<number>`count(*)` }).from(excuses).where(eq(excuses.status, 'approved'));
    const denied = await db.select({ count: sql<number>`count(*)` }).from(excuses).where(eq(excuses.status, 'denied'));
    
    const allExcuses = await this.getAllExcuses();
    const excusesByReason: Record<string, number> = {};
    
    allExcuses.forEach(excuse => {
      const category = this.categorizeReason(excuse.reason);
      excusesByReason[category] = (excusesByReason[category] || 0) + 1;
    });
    
    return {
      totalExcuses: total[0]?.count || 0,
      pendingExcuses: pending[0]?.count || 0,
      approvedExcuses: approved[0]?.count || 0,
      deniedExcuses: denied[0]?.count || 0,
      excusesByReason,
    };
  }

  // Legacy practice excuse methods (for backward compatibility)
  async getPracticeExcuseStats(): Promise<{
    totalExcuses: number;
    pendingExcuses: number;
    approvedExcuses: number;
    deniedExcuses: number;
    excusesByReason: Record<string, number>;
  }> {
    return this.getExcuseStats();
  }

  private categorizeReason(reason: string): string {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('sick') || lowerReason.includes('ill') || lowerReason.includes('health')) {
      return 'Medical';
    } else if (lowerReason.includes('family') || lowerReason.includes('emergency')) {
      return 'Family/Emergency';
    } else if (lowerReason.includes('school') || lowerReason.includes('exam') || lowerReason.includes('university')) {
      return 'Academic';
    } else if (lowerReason.includes('work') || lowerReason.includes('job')) {
      return 'Work';
    } else if (lowerReason.includes('injury') || lowerReason.includes('hurt')) {
      return 'Injury';
    } else {
      return 'Other';
    }
  }

  // Grocery order methods
  async getAllFoodOrders(): Promise<FoodOrder[]> {
    return await db.select().from(groceryOrders);
  }

  async getFoodOrder(id: number): Promise<FoodOrder | undefined> {
    const [order] = await db.select().from(groceryOrders).where(eq(groceryOrders.id, id));
    return order;
  }

  async createFoodOrder(insertOrder: InsertFoodOrder): Promise<FoodOrder> {
    // Enhanced validation and error handling
    if (!insertOrder.playerName?.trim()) {
      throw new Error('Player name is required');
    }
    
    if (!insertOrder.weekStartDate) {
      throw new Error('Week start date is required');
    }

    // Validate week start date format and ensure it's not in the past
    const weekStart = new Date(insertOrder.weekStartDate);
    if (isNaN(weekStart.getTime())) {
      throw new Error('Invalid week start date format');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (weekStart < today) {
      throw new Error('Cannot create orders for past weeks');
    }

    // Check for duplicate orders (same player, same week)
    const existingOrder = await db.select().from(groceryOrders)
      .where(and(
        eq(groceryOrders.playerName, insertOrder.playerName),
        eq(groceryOrders.weekStartDate, insertOrder.weekStartDate),
        sql`${groceryOrders.status} != 'cancelled'`
      ))
      .limit(1);

    if (existingOrder.length > 0) {
      throw new Error(`Order already exists for ${insertOrder.playerName} for week starting ${insertOrder.weekStartDate}`);
    }

    try {
      const [order] = await db
        .insert(groceryOrders)
        .values({
          ...insertOrder,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return order;
    } catch (error) {
      console.error('Database error creating food order:', error);
      throw new Error('Failed to create food order due to database error');
    }
  }

  async updateFoodOrder(id: number, updates: UpdateFoodOrder): Promise<FoodOrder | undefined> {
    const [order] = await db
      .update(groceryOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groceryOrders.id, id))
      .returning();
    return order;
  }

  async deleteFoodOrder(id: number): Promise<boolean> {
    const result = await db.delete(groceryOrders).where(eq(groceryOrders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getFoodOrdersByPlayer(playerName: string): Promise<FoodOrder[]> {
    return await db.select().from(groceryOrders).where(eq(groceryOrders.playerName, playerName));
  }

  async getFoodOrdersByDate(date: string): Promise<FoodOrder[]> {
    return await db.select().from(groceryOrders).where(eq(groceryOrders.weekStartDate, date));
  }

  async getFoodOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  }> {
    const orders = await this.getAllFoodOrders();
    
    // Filter out cancelled orders from active counts
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    
    return {
      totalOrders: activeOrders.length,
      pendingOrders: activeOrders.filter(order => order.status === 'pending').length,
      confirmedOrders: activeOrders.filter(order => order.status === 'confirmed').length,
      deliveredOrders: activeOrders.filter(order => order.status === 'delivered').length,
      cancelledOrders: 0, // Hide cancelled count entirely
    };
  }

  private filterOrdersByDate(orders: FoodOrder[], dateFilter?: string): FoodOrder[] {
    // First filter out cancelled orders entirely
    const activeOrders = orders.filter(order => order.status !== 'cancelled');
    
    if (!dateFilter || dateFilter === 'all') {
      return activeOrders;
    }

    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    return activeOrders.filter(order => {
      const orderDate = new Date(order.weekStartDate);
      
      switch (dateFilter) {
        case 'current-week':
          const nextWeek = new Date(currentWeekStart);
          nextWeek.setDate(currentWeekStart.getDate() + 7);
          return orderDate >= currentWeekStart && orderDate < nextWeek;
        case 'current-month':
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return orderDate >= currentMonthStart && orderDate < nextMonth;
        case 'last-month':
          return orderDate >= lastMonthStart && orderDate < currentMonthStart;
        case 'last-3-months':
          return orderDate >= threeMonthsAgo;
        default:
          return true;
      }
    });
  }

  async getHouseOrderSummary(dateFilter?: string): Promise<{
    [house: string]: {
      totalOrders: number;
      players: string[];
      orderDetails: FoodOrder[];
      consolidatedItems: {
        proteins: string[];
        vegetables: string[];
        fruits: string[];
        grains: string[];
        snacks: string[];
        beverages: string[];
        supplements: string[];
      };
    };
  }> {
    // Validate date filter input
    if (dateFilter && dateFilter !== 'all') {
      const validFilters = ['current-week', 'current-month', 'last-month', 'last-3-months'];
      if (!validFilters.includes(dateFilter)) {
        throw new Error(`Invalid date filter: ${dateFilter}`);
      }
    }

    // Optimize: Use parallel queries for better performance
    const [allPlayers, allOrders] = await Promise.all([
      this.getAllPlayers(),
      this.getAllFoodOrders()
    ]);

    // Create player-house mapping
    const playerHouseMap = new Map<string, string>();
    allPlayers.forEach(player => {
      const fullName = `${player.firstName} ${player.lastName}`;
      playerHouseMap.set(fullName, player.house || 'Unassigned');
    });

    // Filter orders based on date filter and exclude cancelled orders
    const filteredOrders = this.filterOrdersByDate(allOrders, dateFilter);
    
    // Group orders by house
    const houseSummary: any = {};
    
    filteredOrders.forEach(order => {
      const playerHouse = playerHouseMap.get(order.playerName) || 'Unassigned';
      
      if (!houseSummary[playerHouse]) {
        houseSummary[playerHouse] = {
          totalOrders: 0,
          players: new Set<string>(),
          orderDetails: [],
          consolidatedItems: {
            proteins: new Set<string>(),
            vegetables: new Set<string>(),
            fruits: new Set<string>(),
            grains: new Set<string>(),
            snacks: new Set<string>(),
            beverages: new Set<string>(),
            supplements: new Set<string>(),
          }
        };
      }
      
      houseSummary[playerHouse].totalOrders++;
      houseSummary[playerHouse].players.add(order.playerName);
      houseSummary[playerHouse].orderDetails.push(order);
      
      // Consolidate items
      if (order.proteins) {
        order.proteins.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.proteins.add(item.trim())
        );
      }
      if (order.vegetables) {
        order.vegetables.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.vegetables.add(item.trim())
        );
      }
      if (order.fruits) {
        order.fruits.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.fruits.add(item.trim())
        );
      }
      if (order.grains) {
        order.grains.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.grains.add(item.trim())
        );
      }
      if (order.snacks) {
        order.snacks.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.snacks.add(item.trim())
        );
      }
      if (order.beverages) {
        order.beverages.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.beverages.add(item.trim())
        );
      }
      if (order.supplements) {
        order.supplements.split(', ').forEach(item => 
          item.trim() && houseSummary[playerHouse].consolidatedItems.supplements.add(item.trim())
        );
      }
    });
    
    // Convert Sets to Arrays for JSON serialization
    Object.keys(houseSummary).forEach(house => {
      houseSummary[house].players = Array.from(houseSummary[house].players);
      Object.keys(houseSummary[house].consolidatedItems).forEach(category => {
        houseSummary[house].consolidatedItems[category] = Array.from(houseSummary[house].consolidatedItems[category]);
      });
    });
    
    return houseSummary;
  }

  // Event methods (admin-only)
  async getAllEvents(): Promise<Event[]> {
    const eventList = await db.select().from(events);
    return eventList;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...insertEvent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    // Create notifications for participants (exclude "all players" events to avoid spam)
    if (event.participants && !event.participants.toLowerCase().includes('all players') && !event.participants.toLowerCase().includes('entire team')) {
      await this.createNotificationsForAssignees(
        event.participants,
        `New Event: ${event.title}`,
        `You have been assigned to "${event.title}" on ${event.date} at ${event.startTime}. Location: ${event.location || 'TBD'}`,
        'event',
        '/calendar'
      );
    }
    
    return event;
  }

  async updateEvent(id: number, updates: UpdateEvent): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    const eventList = await db
      .select()
      .from(events)
      .where(eq(events.date, date));
    return eventList;
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const eventList = await db
      .select()
      .from(events)
      .where(sql`date >= ${startDate} AND date <= ${endDate}`)
      .orderBy(events.date, events.startTime);
    return eventList;
  }

  // Communication methods
  async getAllMessages(): Promise<any[]> {
    return await db.select().from(messages).orderBy(desc(messages.created_at));
  }

  async getMessage(id: number): Promise<any | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(messageData: any): Promise<any> {
    // Map new schema to existing table structure
    const dbData = {
      from_user_id: messageData.senderId || messageData.from_user_id,
      to_user_id: messageData.recipientId || messageData.to_user_id,
      subject: messageData.senderName || messageData.subject || 'Message',
      content: messageData.content,
      message_type: messageData.messageType || messageData.message_type || 'team',
      is_read: messageData.isRead || false,
      priority: messageData.priority || 'normal',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [message] = await db
      .insert(messages)
      .values(dbData)
      .returning();
    return message;
  }

  async updateMessage(id: number, updates: any): Promise<any | undefined> {
    const [message] = await db
      .update(messages)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteAllTeamMessages(): Promise<number> {
    const result = await db.delete(messages).where(eq(messages.message_type, 'team'));
    return result.rowCount || 0;
  }

  async getMessagesByUser(userId: string): Promise<any[]> {
    return await db.select().from(messages)
      .where(or(eq(messages.from_user_id, userId), eq(messages.to_user_id, userId)))
      .orderBy(desc(messages.created_at));
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ is_read: true, updated_at: new Date() })
      .where(eq(messages.id, messageId));
  }

  // Medical records methods - temporary implementation
  async getAllMedicalRecords(): Promise<any[]> {
    return [];
  }

  async getMedicalRecord(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createMedicalRecord(recordData: any): Promise<any> {
    return { id: Date.now(), ...recordData, createdAt: new Date() };
  }

  async updateMedicalRecord(id: number, updates: any): Promise<any | undefined> {
    return undefined;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    return true;
  }

  async getMedicalRecordsByPlayer(playerId: number): Promise<any[]> {
    return [];
  }

  async getRecentActivities(): Promise<any[]> {
    try {
      // Get recent activities from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activities = [];

      // Recent player registrations
      const recentPlayers = await db.select().from(players)
        .where(gte(players.createdAt, sevenDaysAgo))
        .orderBy(desc(players.createdAt))
        .limit(5);

      for (const player of recentPlayers) {
        activities.push({
          id: `player-${player.id}`,
          type: 'player_registered',
          message: 'New player registered',
          description: `${player.firstName} ${player.lastName} joined ${player.house}`,
          createdAt: player.createdAt,
          playerName: `${player.firstName} ${player.lastName}`
        });
      }

      // Recent grocery orders
      const recentOrders = await db.select().from(groceryOrders)
        .where(gte(groceryOrders.createdAt, sevenDaysAgo))
        .orderBy(desc(groceryOrders.createdAt))
        .limit(5);

      for (const order of recentOrders) {
        activities.push({
          id: `order-${order.id}`,
          type: 'food_order',
          message: 'New grocery order placed',
          description: `Order for ${order.deliveryDay} delivery`,
          createdAt: order.createdAt,
          playerName: order.playerName
        });
      }

      // Recent events
      const recentEvents = await db.select().from(events)
        .where(gte(events.createdAt, sevenDaysAgo))
        .orderBy(desc(events.createdAt))
        .limit(5);

      for (const event of recentEvents) {
        activities.push({
          id: `event-${event.id}`,
          type: 'event_created',
          message: 'New event scheduled',
          description: `${event.title} on ${event.date}`,
          createdAt: event.createdAt,
          playerName: 'Admin'
        });
      }

      // Recent messages
      const recentMessages = await db.select().from(messages)
        .where(gte(messages.created_at, sevenDaysAgo))
        .orderBy(desc(messages.created_at))
        .limit(5);

      for (const message of recentMessages) {
        activities.push({
          id: `message-${message.id}`,
          type: 'message_sent',
          message: 'New message sent',
          description: `Message in ${message.message_type} chat`,
          createdAt: message.created_at,
          playerName: message.from_user_id
        });
      }

      // Sort all activities by date and return top 10
      const sortedActivities = activities
        .filter(activity => activity.createdAt) // Filter out activities without date
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10);

      return sortedActivities;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  }

  // Performance metrics methods - temporary implementation
  async getAllPerformanceMetrics(): Promise<any[]> {
    return [];
  }

  async getPerformanceMetric(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createPerformanceMetric(metricData: any): Promise<any> {
    return { id: Date.now(), ...metricData, createdAt: new Date() };
  }

  async updatePerformanceMetric(id: number, updates: any): Promise<any | undefined> {
    return undefined;
  }

  async deletePerformanceMetric(id: number): Promise<boolean> {
    return true;
  }

  async getPerformanceMetricsByPlayer(playerId: number): Promise<any[]> {
    return [];
  }

  // Document management methods - temporary implementation
  async getAllDocuments(): Promise<any[]> {
    return [];
  }

  async getDocument(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createDocument(documentData: any): Promise<any> {
    return { id: Date.now(), ...documentData, createdAt: new Date() };
  }

  async updateDocument(id: number, updates: any): Promise<any | undefined> {
    return undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return true;
  }

  async getDocumentsByPlayer(playerId: number): Promise<any[]> {
    return [];
  }

  // Event Templates implementation
  async getAllEventTemplates(): Promise<EventTemplate[]> {
    const results = await db.select().from(eventTemplates).orderBy(eventTemplates.name);
    return results;
  }

  async getEventTemplate(id: number): Promise<EventTemplate | undefined> {
    const [template] = await db.select().from(eventTemplates).where(eq(eventTemplates.id, id));
    return template;
  }

  async createEventTemplate(insertTemplate: InsertEventTemplate): Promise<EventTemplate> {
    const [template] = await db
      .insert(eventTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateEventTemplate(id: number, updates: UpdateEventTemplate): Promise<EventTemplate | undefined> {
    const [template] = await db
      .update(eventTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(eventTemplates.id, id))
      .returning();
    return template;
  }

  async deleteEventTemplate(id: number): Promise<boolean> {
    const result = await db.delete(eventTemplates).where(eq(eventTemplates.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getEventTemplatesByUser(userId: string): Promise<EventTemplate[]> {
    const results = await db.select().from(eventTemplates)
      .where(eq(eventTemplates.createdBy, userId))
      .orderBy(eventTemplates.name);
    return results;
  }

  // Notifications implementation
  async getAllNotifications(): Promise<Notification[]> {
    const results = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    return results;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async updateNotification(id: number, updates: UpdateNotification): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const results = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return results;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  // Notification cleanup for long-term scalability
  async cleanupOldNotifications(): Promise<{ deletedCount: number }> {
    // Delete read notifications older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.isRead, true),
        sql`${notifications.createdAt} < ${thirtyDaysAgo.toISOString()}`
      ));
    
    return { deletedCount: result.rowCount || 0 };
  }

  async cleanupOldUnreadNotifications(): Promise<{ deletedCount: number }> {
    // Delete unread notifications older than 90 days (they're probably stale)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const result = await db
      .delete(notifications)
      .where(and(
        eq(notifications.isRead, false),
        sql`${notifications.createdAt} < ${ninetyDaysAgo.toISOString()}`
      ));
    
    return { deletedCount: result.rowCount || 0 };
  }

  // Bulk operations implementation
  async bulkUpdateEvents(eventIds: number[], updates: UpdateEvent): Promise<Event[]> {
    const results = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(inArray(events.id, eventIds))
      .returning();
    return results;
  }

  async bulkDeleteEvents(eventIds: number[]): Promise<boolean> {
    const result = await db.delete(events).where(inArray(events.id, eventIds));
    return (result.rowCount || 0) > 0;
  }

  // Helper method to create notifications for assigned players
  private async createNotificationsForAssignees(
    assignedTo: string | null, 
    title: string, 
    message: string, 
    type: string,
    actionUrl?: string
  ): Promise<void> {
    if (!assignedTo) return;

    try {
      // Try to parse as JSON array first
      const assignedPlayers = JSON.parse(assignedTo);
      
      if (Array.isArray(assignedPlayers)) {
        for (const playerName of assignedPlayers) {
          // Find user by matching player name to their first/last name
          const matchedUsers = await db.select().from(users).where(
            or(
              sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) = ${playerName}`,
              eq(users.firstName, playerName)
            )
          );
          
          if (matchedUsers.length > 0) {
            await this.createNotification({
              userId: matchedUsers[0].id,
              title,
              message,
              type,
              actionUrl
            });
          }
        }
      }
    } catch {
      // Fallback to string parsing
      const assigneeNames = assignedTo.split(',').map(name => name.trim());
      
      for (const playerName of assigneeNames) {
        const foundUsers = await db.select().from(users).where(
          or(
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) = ${playerName}`,
            eq(users.firstName, playerName)
          )
        );
        
        if (foundUsers.length > 0) {
          await this.createNotification({
            userId: foundUsers[0].id,
            title,
            message,
            type,
            actionUrl
          });
        }
      }
    }
  }

  // Delivered orders storage methods implementation
  async getAllDeliveredOrders(): Promise<DeliveredOrder[]> {
    return await db.select().from(deliveredOrders).orderBy(desc(deliveredOrders.deliveryCompletedAt));
  }

  async getDeliveredOrder(id: number): Promise<DeliveredOrder | undefined> {
    const [order] = await db.select().from(deliveredOrders).where(eq(deliveredOrders.id, id));
    return order;
  }

  async createDeliveredOrder(insertOrder: InsertDeliveredOrder): Promise<DeliveredOrder> {
    const [order] = await db
      .insert(deliveredOrders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateDeliveredOrder(id: number, updates: UpdateDeliveredOrder): Promise<DeliveredOrder | undefined> {
    const [order] = await db
      .update(deliveredOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deliveredOrders.id, id))
      .returning();
    return order;
  }

  async deleteDeliveredOrder(id: number): Promise<boolean> {
    const result = await db.delete(deliveredOrders).where(eq(deliveredOrders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getDeliveredOrdersByPlayer(playerName: string): Promise<DeliveredOrder[]> {
    return await db
      .select()
      .from(deliveredOrders)
      .where(eq(deliveredOrders.playerName, playerName))
      .orderBy(desc(deliveredOrders.deliveryCompletedAt));
  }

  async getDeliveredOrdersByDateRange(startDate: string, endDate: string): Promise<DeliveredOrder[]> {
    return await db
      .select()
      .from(deliveredOrders)
      .where(
        and(
          gte(deliveredOrders.deliveryCompletedAt, new Date(startDate)),
          lte(deliveredOrders.deliveryCompletedAt, new Date(endDate))
        )
      )
      .orderBy(desc(deliveredOrders.deliveryCompletedAt));
  }

  async getDeliveredOrderStats(): Promise<{
    totalDeliveries: number;
    deliveriesThisWeek: number;
    deliveriesThisMonth: number;
    averageCost: number;
    topStorageLocations: string[];
  }> {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allDeliveries = await db.select().from(deliveredOrders);
    const weekDeliveries = await db
      .select()
      .from(deliveredOrders)
      .where(gte(deliveredOrders.deliveryCompletedAt, startOfWeek));
    const monthDeliveries = await db
      .select()
      .from(deliveredOrders)
      .where(gte(deliveredOrders.deliveryCompletedAt, startOfMonth));

    const totalCosts = allDeliveries
      .filter(order => order.actualCost)
      .map(order => parseFloat(order.actualCost || '0'));
    const averageCost = totalCosts.length > 0 
      ? totalCosts.reduce((sum, cost) => sum + cost, 0) / totalCosts.length 
      : 0;

    const storageLocations = allDeliveries
      .filter(order => order.storageLocation)
      .reduce((acc, order) => {
        const location = order.storageLocation!;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topStorageLocations = Object.entries(storageLocations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location]) => location);

    return {
      totalDeliveries: allDeliveries.length,
      deliveriesThisWeek: weekDeliveries.length,
      deliveriesThisMonth: monthDeliveries.length,
      averageCost: Math.round(averageCost * 100) / 100,
      topStorageLocations,
    };
  }

  // Password reset methods
  async generatePasswordResetToken(email: string): Promise<string | null> {
    try {
      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return null;
      }

      // Generate secure token
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Update user with reset token
      await db.update(users)
        .set({
          passwordResetToken: token,
          passwordResetExpiry: expiry,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      return token;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      return null;
    }
  }

  async validatePasswordResetToken(token: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
      if (!user || !user.passwordResetExpiry) {
        return null;
      }

      // Check if token has expired
      if (new Date() > user.passwordResetExpiry) {
        // Clear expired token
        await db.update(users)
          .set({
            passwordResetToken: null,
            passwordResetExpiry: null,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating password reset token:', error);
      return null;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      await db.update(users)
        .set({
          password: newPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();