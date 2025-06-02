import {
  users,
  players,
  chores,
  excuses,
  practiceExcuses,
  groceryOrders,
  events,
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
  type Event,
  type InsertEvent,
  type UpdateEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getPendingUsers(): Promise<User[]>;
  approveUser(userId: string): Promise<void>;
  updateUserProfile(userId: string, profileData: {
    dateOfBirth?: string;
    nationality?: string;
    position?: string;
  }): Promise<void>;

  // Player methods
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined>;
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

  // Event methods (admin-only)
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: UpdateEvent): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEventsByDate(date: string): Promise<Event[]>;
  getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]>;

  // Communication methods
  getAllMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: UpdateMessage): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  getMessagesByUser(userId: string): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Medical records methods (admin-only)
  getAllMedicalRecords(): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, updates: UpdateMedicalRecord): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number): Promise<boolean>;
  getMedicalRecordsByPlayer(playerId: number): Promise<MedicalRecord[]>;

  // Performance metrics methods
  getAllPerformanceMetrics(): Promise<PerformanceMetric[]>;
  getPerformanceMetric(id: number): Promise<PerformanceMetric | undefined>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  updatePerformanceMetric(id: number, updates: UpdatePerformanceMetric): Promise<PerformanceMetric | undefined>;
  deletePerformanceMetric(id: number): Promise<boolean>;
  getPerformanceMetricsByPlayer(playerId: number): Promise<PerformanceMetric[]>;

  // Document management methods (admin-only)
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: UpdateDocument): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getDocumentsByPlayer(playerId: number): Promise<Document[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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
          approved: userData.approved,
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

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.approved, "false"));
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
      .set({ approved: "true", updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Create player record automatically
    await this.syncUserToPlayer(user);
  }

  async updateUserProfile(userId: string, profileData: {
    dateOfBirth?: string;
    nationality?: string;
    position?: string;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
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
      .where(eq(users.approved, "true"));

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
    let query = db.select().from(players);
    
    if (filters.position) {
      query = query.where(eq(players.position, filters.position));
    }
    
    return await query;
  }

  async getPlayerStats(): Promise<{ totalPlayers: number; countries: number }> {
    const totalPlayers = await db.select({ count: sql<number>`count(*)` }).from(players);
    const countries = await db.select({ count: sql<number>`count(DISTINCT ${players.nationality})` }).from(players);
    
    return {
      totalPlayers: totalPlayers[0]?.count || 0,
      countries: countries[0]?.count || 0,
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
    const [chore] = await db
      .insert(chores)
      .values(insertChore)
      .returning();
    return chore;
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
    const [order] = await db
      .insert(groceryOrders)
      .values(insertOrder)
      .returning();
    return order;
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
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      confirmedOrders: orders.filter(order => order.status === 'confirmed').length,
      deliveredOrders: orders.filter(order => order.status === 'delivered').length,
      cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
    };
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

  // Communication methods - temporary implementation
  async getAllMessages(): Promise<any[]> {
    // Return mock data for now
    return [];
  }

  async getMessage(id: number): Promise<any | undefined> {
    return undefined;
  }

  async createMessage(messageData: any): Promise<any> {
    // Mock creation - return the data with an ID
    return {
      id: Date.now(),
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: false
    };
  }

  async updateMessage(id: number, updates: any): Promise<any | undefined> {
    return undefined;
  }

  async deleteMessage(id: number): Promise<boolean> {
    return true;
  }

  async getMessagesByUser(userId: string): Promise<any[]> {
    return [];
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    // Mock implementation
    return;
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
}

export const storage = new DatabaseStorage();