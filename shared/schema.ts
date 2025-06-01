import { pgTable, text, serial, integer, real, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  position: text("position").notNull(), // goalkeeper, defender, midfielder, forward
  // ageGroup removed - single Bundesliga Talent Program
  status: text("status").notNull().default("active"), // active, on_trial, inactive
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward"]),
  // ageGroup removed - single team structure
  status: z.enum(["active", "on_trial", "inactive"]).default("active"),
  notes: z.string().optional(),
});

export const updatePlayerSchema = insertPlayerSchema.partial();

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type UpdatePlayer = z.infer<typeof updatePlayerSchema>;
export type Player = typeof players.$inferSelect;

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with role-based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("player"), // admin, player
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // cleaning, trash, maintenance, other
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  house: text("house").notNull().default("Widdersdorf 1"), // Widdersdorf 1, Widdersdorf 2, Widdersdorf 3
  assignedTo: text("assigned_to"),
  dueDate: text("due_date"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertChoreSchema = createInsertSchema(chores).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["cleaning", "trash", "maintenance", "other"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).default("Widdersdorf 1"),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateChoreSchema = insertChoreSchema.partial();

export type InsertChore = z.infer<typeof insertChoreSchema>;
export type UpdateChore = z.infer<typeof updateChoreSchema>;
export type Chore = typeof chores.$inferSelect;

// Practice excuses table
export const practiceExcuses = pgTable("practice_excuses", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  submittedAt: text("submitted_at").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  notes: text("notes")
});

export const insertPracticeExcuseSchema = createInsertSchema(practiceExcuses).omit({
  id: true,
  submittedAt: true,
  reviewedBy: true,
  reviewedAt: true
});

export const updatePracticeExcuseSchema = insertPracticeExcuseSchema.partial();

export type InsertPracticeExcuse = z.infer<typeof insertPracticeExcuseSchema>;
export type UpdatePracticeExcuse = z.infer<typeof updatePracticeExcuseSchema>;
export type PracticeExcuse = typeof practiceExcuses.$inferSelect;
