// shared/schema.ts - FC Köln Management System Database Schema (matching existing DB structure)
import { pgTable, varchar, boolean, integer, timestamp, text, serial, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table - comprehensive user management (admins, staff, players)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default('player'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  approved: text("approved").notNull().default('false'),
  dateOfBirth: varchar("date_of_birth"),
  nationality: varchar("nationality"),
  position: varchar("position"),
  username: varchar("username"),
  password: varchar("password"),
  status: text("status").default('pending'),
  nationalityCode: varchar("nationality_code"),
  house: varchar("house"),
  phoneNumber: varchar("phone_number"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  phone: varchar("phone"),
  preferredFoot: varchar("preferred_foot"),
  height: integer("height"),
  weight: integer("weight"),
  previousClub: varchar("previous_club"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalConditions: text("medical_conditions"),
  allergies: text("allergies"),
  jerseyNumber: integer("jersey_number"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
});

export type User = typeof users.$inferSelect;

// Players table - separate player management
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  position: text("position").notNull(),
  status: text("status").notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  profileImageUrl: text("profile_image_url"),
  house: text("house").default('Widdersdorf 1'),
  age: integer("age"),
  nationalityCode: text("nationality_code"),
  positions: jsonb("positions"),
  availability: text("availability").default('available'),
  availabilityReason: text("availability_reason"),
  phoneNumber: text("phone_number"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  medicalConditions: text("medical_conditions"),
  allergies: text("allergies"),
});

export type Player = typeof players.$inferSelect;

// Events table - calendar and scheduling
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  participants: text("participants"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"),
  recurringEndDate: text("recurring_end_date"),
  recurringDays: text("recurring_days"),
  parentEventId: integer("parent_event_id"),
});

export type Event = typeof events.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id"),
  toUserId: varchar("to_user_id"),
  subject: varchar("subject"),
  content: text("content"),
  isRead: boolean("is_read"),
  priority: varchar("priority"),
  messageType: varchar("message_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Message = typeof messages.$inferSelect;

// Chores table
export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  category: text("category"),
  frequency: text("frequency"),
  house: text("house"),
  assignedTo: text("assigned_to"),
  dueDate: text("due_date"),
  status: text("status"),
  priority: text("priority"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  isRecurring: boolean("is_recurring"),
  recurringPattern: text("recurring_pattern"),
  createdBy: text("created_by"),
});

export type Chore = typeof chores.$inferSelect;

// Grocery orders table
export const groceryOrders = pgTable("grocery_orders", {
  id: serial("id").primaryKey(),
  playerName: varchar("player_name"),
  weekStartDate: varchar("week_start_date"),
  deliveryDay: varchar("delivery_day"),
  proteins: text("proteins"),
  vegetables: text("vegetables"),
  fruits: text("fruits"),
  grains: text("grains"),
  snacks: text("snacks"),
  beverages: text("beverages"),
  supplements: text("supplements"),
  specialRequests: text("special_requests"),
  dietaryRestrictions: text("dietary_restrictions"),
  estimatedCost: varchar("estimated_cost"),
  status: varchar("status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  adminNotes: text("admin_notes"),
});

export type GroceryOrder = typeof groceryOrders.$inferSelect;

// Apps table (existing from template)
export const apps = pgTable("apps", {
  id: varchar("id", { length: 40 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull(),
  allowedOrigins: text("allowed_origins").notNull(),
  rateLimitPerMin: integer("rate_limit_per_min").notNull().default(600),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type App = typeof apps.$inferSelect;
