import { users, joinRequests, type User, type InsertUser, type JoinRequest, type InsertJoinRequest } from "../shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Join request management
  createJoinRequest(insertJoinRequest: InsertJoinRequest): Promise<JoinRequest>;
  getJoinRequests(): Promise<JoinRequest[]>;
  getJoinRequest(id: number): Promise<JoinRequest | undefined>;
  updateJoinRequestStatus(id: number, status: 'approved' | 'rejected', adminNotes?: string, reviewedBy?: number): Promise<JoinRequest>;
  deleteJoinRequest(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Join request management methods
  async createJoinRequest(insertJoinRequest: InsertJoinRequest): Promise<JoinRequest> {
    const [joinRequest] = await db
      .insert(joinRequests)
      .values({
        ...insertJoinRequest,
        updatedAt: new Date(),
      })
      .returning();
    return joinRequest;
  }

  async getJoinRequests(): Promise<JoinRequest[]> {
    return await db
      .select()
      .from(joinRequests)
      .orderBy(desc(joinRequests.createdAt));
  }

  async getJoinRequest(id: number): Promise<JoinRequest | undefined> {
    const [joinRequest] = await db.select().from(joinRequests).where(eq(joinRequests.id, id));
    return joinRequest || undefined;
  }

  async updateJoinRequestStatus(
    id: number, 
    status: 'approved' | 'rejected', 
    adminNotes?: string, 
    reviewedBy?: number
  ): Promise<JoinRequest> {
    const [joinRequest] = await db
      .update(joinRequests)
      .set({
        status,
        adminNotes,
        reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(joinRequests.id, id))
      .returning();
    return joinRequest;
  }

  async deleteJoinRequest(id: number): Promise<void> {
    await db.delete(joinRequests).where(eq(joinRequests.id, id));
  }
}

export const storage = new DatabaseStorage();