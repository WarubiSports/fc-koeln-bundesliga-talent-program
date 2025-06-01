import {
  users,
  players,
  chores,
  practiceExcuses,
  groceryOrders,
  type User,
  type UpsertUser,
  type Player,
  type InsertPlayer,
  type UpdatePlayer,
  type Chore,
  type InsertChore,
  type UpdateChore,
  type PracticeExcuse,
  type InsertPracticeExcuse,
  type UpdatePracticeExcuse,
  type GroceryOrder,
  type InsertGroceryOrder,
  type UpdateGroceryOrder,
  type FoodOrder,
  type InsertFoodOrder,
  type UpdateFoodOrder,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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

  // Practice excuse methods
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
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          approved: userData.approved,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
    return await db.select().from(practiceExcuses).where(eq(practiceExcuses.date, date));
  }

  async getPracticeExcuseStats(): Promise<{
    totalExcuses: number;
    pendingExcuses: number;
    approvedExcuses: number;
    deniedExcuses: number;
    excusesByReason: Record<string, number>;
  }> {
    const total = await db.select({ count: sql<number>`count(*)` }).from(practiceExcuses);
    const pending = await db.select({ count: sql<number>`count(*)` }).from(practiceExcuses).where(eq(practiceExcuses.status, 'pending'));
    const approved = await db.select({ count: sql<number>`count(*)` }).from(practiceExcuses).where(eq(practiceExcuses.status, 'approved'));
    const denied = await db.select({ count: sql<number>`count(*)` }).from(practiceExcuses).where(eq(practiceExcuses.status, 'denied'));
    
    const allExcuses = await this.getAllPracticeExcuses();
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
}

export const storage = new DatabaseStorage();