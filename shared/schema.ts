// shared/schema.ts - FC Köln Management System Database Schema (matching existing DB structure)
import { pgTable, varchar, boolean, integer, timestamp, text, serial, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table - comprehensive user management (admins, staff, players)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  appId: varchar("app_id"), // Multi-tenant: which app this user belongs to
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
  healthStatus: varchar("health_status").default('healthy'), // "healthy" or "injured"
  injuryType: varchar("injury_type"), // Description of injury
  injuryDate: varchar("injury_date"), // Date when injury occurred
  injuryEndDate: varchar("injury_end_date"), // Expected recovery date
});

export type User = typeof users.$inferSelect;

// Players table - separate player management
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id"), // Multi-tenant: which app this player belongs to
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
  appId: varchar("app_id"), // Multi-tenant: which app this event belongs to
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

// Event Attendance table - tracks RSVP and attendance for events
export const eventAttendance = pgTable("event_attendance", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(), // References events.id
  userId: varchar("user_id").notNull(), // References users.id
  appId: varchar("app_id").notNull(), // Multi-tenant
  status: varchar("status").notNull().default('pending'), // 'pending', 'attending', 'not_attending', 'attended', 'absent'
  markedBy: varchar("marked_by"), // user_id of staff who marked attendance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EventAttendance = typeof eventAttendance.$inferSelect;

// Chores table - player house chores and tasks
export const chores = pgTable("chores", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id").notNull(), // Multi-tenant: which app this chore belongs to
  title: text("title").notNull(), // Chore type: "Blue Trash", "Kitchen", "Bathroom 1", etc.
  description: text("description"), // Optional details or instructions
  category: text("category"), // Optional grouping
  frequency: text("frequency"), // "weekly", "daily", "one-time"
  house: text("house").notNull(), // "1", "2", "3", "4"
  assignedTo: text("assigned_to").notNull(), // user_id of assigned player
  dueDate: text("due_date"), // When chore is due
  weekStartDate: text("week_start_date"), // Which week this chore is for (for rotation tracking)
  status: text("status").notNull().default('pending'), // "pending", "completed", "verified", "rejected"
  priority: text("priority"), // Optional priority level
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"), // When player marked as done
  verifiedAt: timestamp("verified_at"), // When staff verified
  verifiedBy: text("verified_by"), // user_id of staff who verified
  startTime: text("start_time"),
  endTime: text("end_time"),
  isRecurring: boolean("is_recurring").default(true), // true for weekly rotation, false for one-off
  recurringPattern: text("recurring_pattern"), // "weekly"
  createdBy: text("created_by").notNull(), // user_id of staff who created
});

export type Chore = typeof chores.$inferSelect;

// Grocery Items Catalog - all available items from spreadsheet
export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id").notNull(), // Multi-tenant
  name: text("name").notNull(),
  category: text("category").notNull(), // 'household', 'produce', 'meat', 'dairy', 'carbs', 'drinks', 'spices', 'frozen'
  price: text("price").notNull(), // Note: Using text for compatibility with existing data, will convert to numeric later
  createdAt: timestamp("created_at").defaultNow(),
});

export type GroceryItem = typeof groceryItems.$inferSelect;

// Player Grocery Orders - individual orders by players
export const groceryPlayerOrders = pgTable("grocery_player_orders", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id").notNull(), // Multi-tenant
  userId: varchar("user_id").notNull(), // References users.id
  deliveryDate: text("delivery_date").notNull(), // Tuesday or Friday delivery
  totalAmount: text("total_amount").notNull(), // Note: Using text for compatibility with existing data
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected', 'delivered'
  createdAt: timestamp("created_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export type GroceryPlayerOrder = typeof groceryPlayerOrders.$inferSelect;

// Grocery Order Items - line items in each order
export const groceryOrderItems = pgTable("grocery_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(), // References grocery_player_orders.id
  itemId: integer("item_id").notNull(), // References grocery_items.id
  quantity: integer("quantity").notNull(),
  priceAtOrder: text("price_at_order").notNull(), // Note: Using text for compatibility
  createdAt: timestamp("created_at").defaultNow(),
});

export type GroceryOrderItem = typeof groceryOrderItems.$inferSelect;

// Legacy Grocery orders table (kept for backward compatibility)
export const groceryOrders = pgTable("grocery_orders", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id"), // Multi-tenant: which app this order belongs to
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

// Applications table - for pending staff/player applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id"), // Multi-tenant: which app this application belongs to
  name: text("name").notNull(),
  email: text("email").notNull(),
  age: integer("age"),
  position: text("position"),
  nationality: text("nationality"),
  type: text("type").notNull(), // 'player' or 'staff'
  department: text("department"),
  applicationDate: timestamp("application_date").defaultNow(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  notes: text("notes"),
  documents: text("documents"), // JSON array as text
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by"),
});

export type Application = typeof applications.$inferSelect;

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

// Legacy FC Köln tables - to be migrated
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id"), // Multi-tenant
  userId: varchar("user_id"),
  title: varchar("title"),
  message: text("message"),
  type: varchar("type"),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"),
  relatedEventId: integer("related_event_id"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Player Evaluations table - Warubi Hub player evaluation intake and scoring
export const playerEvaluations = pgTable("player_evaluations", {
  id: serial("id").primaryKey(),
  appId: varchar("app_id").default('warubi-hub'), // Multi-tenant
  
  // Step 1: Basic Info
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  yearOfBirth: integer("year_of_birth").notNull(),
  gradYear: integer("grad_year"),
  primaryPositions: text("primary_positions").notNull(), // JSON array
  secondaryPositions: text("secondary_positions"), // JSON array
  dominantFoot: varchar("dominant_foot").notNull(), // 'left', 'right', 'both'
  
  // Step 2: Club & League Context
  currentClub: text("current_club").notNull(),
  currentLeague: varchar("current_league").notNull(), // MLS NEXT, ECNL, PPL, GA, etc.
  otherLeague: text("other_league"), // If "Other" is selected
  ageGroup: varchar("age_group").notNull(), // U13-U19
  stateRegion: varchar("state_region").notNull(),
  
  // Step 3: Playing Profile
  height: integer("height").notNull(), // in inches or cm
  weight: integer("weight").notNull(), // in lbs or kg
  primaryStrengths: text("primary_strengths"), // JSON array of tags/text
  areasToImprove: text("areas_to_improve"), // JSON array of tags/text
  
  // Step 4: Experience & Stats
  yearsAtCurrentLevel: integer("years_at_current_level").notNull(),
  previousClubs: text("previous_clubs"), // JSON array
  seasonAppearances: integer("season_appearances").default(0),
  seasonStarts: integer("season_starts").default(0),
  seasonGoals: integer("season_goals").default(0),
  seasonAssists: integer("season_assists").default(0),
  notableAchievements: text("notable_achievements"), // JSON array
  hasNationalTeamExperience: boolean("has_national_team_experience").default(false),
  nationalTeamDetails: text("national_team_details"),
  hasProAcademyExperience: boolean("has_pro_academy_experience").default(false),
  proAcademyDetails: text("pro_academy_details"),
  
  // Step 5: Aspirations & Context
  mainGoals: text("main_goals").notNull(), // JSON array: college, abroad, pro, improve
  preferredRegion: varchar("preferred_region").notNull(), // USA only, USA & Europe, Europe preferred, Open
  readinessTimeline: varchar("readiness_timeline").notNull(), // 6-12 months, 1-2 years, 2+ years
  
  // Step 6: Media & Contact
  highlightVideoUrl: text("highlight_video_url").notNull(),
  fullGameLinks: text("full_game_links"), // JSON array
  consentToContact: boolean("consent_to_contact").notNull().default(true),
  
  // Computed Outputs from Scoring Engine
  score: integer("score"), // Numeric score (0-100)
  bucket: varchar("bucket"), // A, B, C, D
  rating: varchar("rating"), // "Advanced Level", "Competitive Level", etc.
  tags: text("tags"), // JSON array of generated tags
  
  // Metadata
  status: varchar("status").notNull().default('submitted'), // submitted, reviewed, archived
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PlayerEvaluation = typeof playerEvaluations.$inferSelect;
export type InsertPlayerEvaluation = typeof playerEvaluations.$inferInsert;
