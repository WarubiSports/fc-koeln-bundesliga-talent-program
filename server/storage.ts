import { players, users, type Player, type InsertPlayer, type UpdatePlayer, type User, type InsertUser } from "@shared/schema";

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
    activeTeams: number;
    countries: number;
    avgRating: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private currentUserId: number;
  private currentPlayerId: number;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.currentUserId = 1;
    this.currentPlayerId = 1;
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
      rating: insertPlayer.rating || 0,
      status: insertPlayer.status || "active",
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
    activeTeams: number;
    countries: number;
    avgRating: number;
  }> {
    const allPlayers = Array.from(this.players.values());
    const totalPlayers = allPlayers.length;
    
    // Calculate unique age groups as "teams"
    const activeTeams = new Set(allPlayers.map(p => p.ageGroup)).size;
    
    // Calculate unique countries
    const countries = new Set(allPlayers.map(p => p.nationality)).size;
    
    // Calculate average rating
    const totalRating = allPlayers.reduce((sum, player) => sum + (player.rating || 0), 0);
    const avgRating = totalPlayers > 0 ? Number((totalRating / totalPlayers).toFixed(1)) : 0;

    return {
      totalPlayers,
      activeTeams,
      countries,
      avgRating,
    };
  }
}

export const storage = new MemStorage();
