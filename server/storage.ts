import { players, users, chores, practiceExcuses, type Player, type InsertPlayer, type UpdatePlayer, type User, type InsertUser, type Chore, type InsertChore, type UpdateChore, type PracticeExcuse, type InsertPracticeExcuse, type UpdatePracticeExcuse } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private chores: Map<number, Chore>;
  private practiceExcuses: Map<number, PracticeExcuse>;
  private currentUserId: number;
  private currentPlayerId: number;
  private currentChoreId: number;
  private currentPracticeExcuseId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.chores = new Map();
    this.currentUserId = 1;
    this.currentPlayerId = 1;
    this.currentChoreId = 1;
    
    // Add some initial chores
    this.seedChores();
  }

  private seedChores() {
    const initialChores: Omit<Chore, 'id'>[] = [
      {
        title: "Take out recycling bin",
        description: "Put recycling bin out on curb for pickup",
        category: "trash",
        frequency: "weekly",
        house: "Widdersdorf 1",
        assignedTo: "John",
        dueDate: "2024-06-07",
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        title: "Clean bathroom",
        description: "Deep clean main bathroom - toilet, sink, shower, floor",
        category: "cleaning",
        frequency: "weekly",
        house: "Widdersdorf 2",
        assignedTo: "Sarah",
        dueDate: "2024-06-05",
        status: "pending",
        priority: "high",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        title: "Take out garbage bin",
        description: "Put garbage bin out for collection",
        category: "trash",
        frequency: "weekly",
        house: "Widdersdorf 3",
        assignedTo: "Mike",
        dueDate: "2024-06-06",
        status: "completed",
        priority: "medium",
        createdAt: new Date(),
        completedAt: new Date(),
      },
      {
        title: "Clean kitchen",
        description: "Wipe counters, clean appliances, mop floor",
        category: "cleaning",
        frequency: "daily",
        house: "Widdersdorf 1",
        assignedTo: "Anna",
        dueDate: "2024-06-01",
        status: "in_progress",
        priority: "high",
        createdAt: new Date(),
        completedAt: null,
      },
    ];

    initialChores.forEach(chore => {
      const id = this.currentChoreId++;
      this.chores.set(id, { ...chore, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Player methods
  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = {
      ...insertPlayer,
      id,
      status: insertPlayer.status || "active",
      notes: insertPlayer.notes || null,
      createdAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: number, updates: UpdatePlayer): Promise<Player | undefined> {
    const existingPlayer = this.players.get(id);
    if (!existingPlayer) {
      return undefined;
    }

    const updatedPlayer: Player = {
      ...existingPlayer,
      ...updates,
    };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<boolean> {
    return this.players.delete(id);
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.players.values()).filter(player =>
      player.firstName.toLowerCase().includes(searchTerm) ||
      player.lastName.toLowerCase().includes(searchTerm) ||
      player.email.toLowerCase().includes(searchTerm) ||
      player.nationality.toLowerCase().includes(searchTerm)
    );
  }

  async filterPlayers(filters: {
    position?: string;
    ageGroup?: string;
    nationality?: string;
    status?: string;
  }): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => {
      if (filters.position && player.position !== filters.position) return false;
      if (filters.ageGroup && player.ageGroup !== filters.ageGroup) return false;
      if (filters.nationality && player.nationality !== filters.nationality) return false;
      if (filters.status && player.status !== filters.status) return false;
      return true;
    });
  }

  async getPlayerStats(): Promise<{
    totalPlayers: number;
    countries: number;
  }> {
    const allPlayers = Array.from(this.players.values());
    const totalPlayers = allPlayers.length;
    
    // Calculate unique countries
    const countries = new Set(allPlayers.map(p => p.nationality)).size;

    return {
      totalPlayers,
      countries,
    };
  }

  // Chore methods
  async getAllChores(): Promise<Chore[]> {
    return Array.from(this.chores.values()).sort((a, b) => 
      new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime()
    );
  }

  async getChore(id: number): Promise<Chore | undefined> {
    return this.chores.get(id);
  }

  async createChore(insertChore: InsertChore): Promise<Chore> {
    const id = this.currentChoreId++;
    const chore: Chore = {
      ...insertChore,
      id,
      status: insertChore.status || "pending",
      priority: insertChore.priority || "medium",
      description: insertChore.description || null,
      assignedTo: insertChore.assignedTo || null,
      dueDate: insertChore.dueDate || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.chores.set(id, chore);
    return chore;
  }

  async updateChore(id: number, updates: UpdateChore): Promise<Chore | undefined> {
    const existingChore = this.chores.get(id);
    if (!existingChore) {
      return undefined;
    }

    const updatedChore: Chore = {
      ...existingChore,
      ...updates,
      completedAt: updates.status === "completed" ? new Date() : existingChore.completedAt,
    };
    this.chores.set(id, updatedChore);
    return updatedChore;
  }

  async deleteChore(id: number): Promise<boolean> {
    return this.chores.delete(id);
  }

  async getChoresByHouse(house: string): Promise<Chore[]> {
    return Array.from(this.chores.values())
      .filter(chore => chore.house === house)
      .sort((a, b) => 
        new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime()
      );
  }

  async getChoreStats(): Promise<{
    totalChores: number;
    pendingChores: number;
    completedChores: number;
    overdueChores: number;
  }> {
    const allChores = Array.from(this.chores.values());
    const totalChores = allChores.length;
    
    const pendingChores = allChores.filter(c => c.status === "pending").length;
    const completedChores = allChores.filter(c => c.status === "completed").length;
    
    const today = new Date().toISOString().split('T')[0];
    const overdueChores = allChores.filter(c => 
      c.status !== "completed" && c.dueDate && c.dueDate < today
    ).length;

    return {
      totalChores,
      pendingChores,
      completedChores,
      overdueChores,
    };
  }
}

export const storage = new MemStorage();
