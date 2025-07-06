import { pgTable, text, serial, integer, real, timestamp, varchar, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  age: integer("age"), // calculated field for easy filtering
  nationality: text("nationality").notNull(),
  nationalityCode: text("nationality_code"), // ISO country code for flag display (e.g., "DE", "BR", "FR")
  positions: jsonb("positions"), // JSON array for multiple positions: ["goalkeeper", "defender"]
  position: text("position").notNull(), // primary position for backward compatibility
  house: text("house").default("Widdersdorf 1"), // Widdersdorf 1, Widdersdorf 2, Widdersdorf 3
  status: text("status").notNull().default("active"), // active, on_trial, inactive
  availability: text("availability").notNull().default("available"), // available, unavailable, injured, suspended
  availabilityReason: text("availability_reason"), // reason for unavailability
  profileImageUrl: text("profile_image_url"),
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
  age: z.number().min(16).max(30).optional(),
  nationality: z.string().min(1, "Nationality is required"),
  nationalityCode: z.string().length(2, "Country code must be 2 characters").optional().or(z.literal("")),
  positions: z.array(z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker", "Center-back", "Fullback", "Defensive-midfielder", "Attacking-midfielder"])).optional(),
  position: z.enum(["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker", "Center-back", "Fullback", "Defensive-midfielder", "Attacking-midfielder"]),
  house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).default("Widdersdorf 1"),
  status: z.enum(["active", "on_trial", "inactive"]).default("active"),
  availability: z.enum(["available", "unavailable", "injured", "suspended"]).default("available"),
  availabilityReason: z.string().optional(),
  profileImageUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
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
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  dateOfBirth: varchar("date_of_birth"),
  nationality: varchar("nationality"),
  nationalityCode: varchar("nationality_code"),
  position: varchar("position"),
  role: text("role").notNull().default("player"), // admin, player, coach, staff, manager
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  house: varchar("house"),
  phoneNumber: varchar("phone_number"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  // Additional player fields
  phone: varchar("phone"),
  preferredFoot: varchar("preferred_foot"),
  height: integer("height"), // in cm
  weight: integer("weight"), // in kg
  previousClub: varchar("previous_club"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalConditions: text("medical_conditions"),
  allergies: text("allergies"),
  jerseyNumber: integer("jersey_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
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
  assignedTo: text("assigned_to"), // JSON string array of player IDs/names
  dueDate: text("due_date"),
  startTime: text("start_time"), // for calendar integration
  endTime: text("end_time"), // for calendar integration
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // daily, weekly, monthly
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdBy: text("created_by").notNull(),
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
  assignedTo: z.string().optional(), // JSON string array of player names/IDs
  dueDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  createdBy: z.string().min(1, "Creator is required"),
});

export const updateChoreSchema = insertChoreSchema.partial();

export type InsertChore = z.infer<typeof insertChoreSchema>;
export type UpdateChore = z.infer<typeof updateChoreSchema>;
export type Chore = typeof chores.$inferSelect;

// Excuses table (generalized for any type of excuse)
export const excuses = pgTable("excuses", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  activity: text("activity").notNull(), // Team Practice, Cryotherapy, etc.
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  submittedAt: text("submitted_at").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  notes: text("notes")
});

export const insertExcuseSchema = createInsertSchema(excuses).omit({
  id: true,
  submittedAt: true,
  reviewedBy: true,
  reviewedAt: true
});

export const updateExcuseSchema = insertExcuseSchema.partial();

export type InsertExcuse = z.infer<typeof insertExcuseSchema>;
export type UpdateExcuse = z.infer<typeof updateExcuseSchema>;
export type Excuse = typeof excuses.$inferSelect;

// Legacy aliases for backward compatibility
export const practiceExcuses = excuses;
export const insertPracticeExcuseSchema = insertExcuseSchema;
export const updatePracticeExcuseSchema = updateExcuseSchema;
export type InsertPracticeExcuse = InsertExcuse;
export type UpdatePracticeExcuse = UpdateExcuse;
export type PracticeExcuse = Excuse;

// Grocery Orders Schema - Weekly ordering for Monday and Thursday
export const groceryOrders = pgTable("grocery_orders", {
  id: serial("id").primaryKey(),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  weekStartDate: varchar("week_start_date", { length: 50 }).notNull(), // Monday of the week
  deliveryDay: varchar("delivery_day", { length: 20 }).notNull(), // "monday" or "thursday"
  
  // Grocery categories
  proteins: text("proteins"), // meat, fish, eggs, dairy
  vegetables: text("vegetables"), // fresh vegetables
  fruits: text("fruits"), // fresh fruits
  grains: text("grains"), // bread, pasta, rice, cereals
  snacks: text("snacks"), // healthy snacks, protein bars
  beverages: text("beverages"), // water, juices, sports drinks
  supplements: text("supplements"), // protein powder, vitamins
  
  specialRequests: text("special_requests"),
  dietaryRestrictions: text("dietary_restrictions"),
  estimatedCost: varchar("estimated_cost", { length: 20 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, delivered, cancelled
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  playerNameIdx: index("grocery_orders_player_idx").on(table.playerName),
  weekStartIdx: index("grocery_orders_week_idx").on(table.weekStartDate),
  statusIdx: index("grocery_orders_status_idx").on(table.status),
  playerWeekIdx: index("grocery_orders_player_week_idx").on(table.playerName, table.weekStartDate),
}));

export const insertGroceryOrderSchema = createInsertSchema(groceryOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateGroceryOrderSchema = insertGroceryOrderSchema.partial();

export type InsertGroceryOrder = z.infer<typeof insertGroceryOrderSchema>;
export type UpdateGroceryOrder = z.infer<typeof updateGroceryOrderSchema>;
export type GroceryOrder = typeof groceryOrders.$inferSelect;

// Legacy compatibility for existing code
export const insertFoodOrderSchema = insertGroceryOrderSchema;
export const updateFoodOrderSchema = updateGroceryOrderSchema;
export type InsertFoodOrder = InsertGroceryOrder;
export type UpdateFoodOrder = UpdateGroceryOrder;
export type FoodOrder = GroceryOrder;

// Delivered Orders Storage Schema - For tracking and storing completed deliveries
export const deliveredOrders = pgTable("delivered_orders", {
  id: serial("id").primaryKey(),
  originalOrderId: integer("original_order_id").notNull(),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  weekStartDate: varchar("week_start_date", { length: 50 }).notNull(),
  deliveryDay: varchar("delivery_day", { length: 20 }).notNull(),
  
  // Delivered items (what was actually delivered)
  deliveredProteins: text("delivered_proteins"),
  deliveredVegetables: text("delivered_vegetables"),
  deliveredFruits: text("delivered_fruits"),
  deliveredGrains: text("delivered_grains"),
  deliveredSnacks: text("delivered_snacks"),
  deliveredBeverages: text("delivered_beverages"),
  deliveredSupplements: text("delivered_supplements"),
  
  // Original order items (for comparison)
  orderedProteins: text("ordered_proteins"),
  orderedVegetables: text("ordered_vegetables"),
  orderedFruits: text("ordered_fruits"),
  orderedGrains: text("ordered_grains"),
  orderedSnacks: text("ordered_snacks"),
  orderedBeverages: text("ordered_beverages"),
  orderedSupplements: text("ordered_supplements"),
  
  actualCost: varchar("actual_cost", { length: 20 }),
  estimatedCost: varchar("estimated_cost", { length: 20 }),
  deliveryNotes: text("delivery_notes"),
  storageLocation: varchar("storage_location", { length: 255 }), // where items are stored
  deliveredBy: varchar("delivered_by", { length: 255 }), // staff member who delivered
  receivedBy: varchar("received_by", { length: 255 }), // player who received
  deliveryCompletedAt: timestamp("delivery_completed_at").defaultNow(),
  
  // Quality tracking
  itemCondition: varchar("item_condition", { length: 50 }).default("good"), // good, damaged, missing_items
  playerSatisfaction: varchar("player_satisfaction", { length: 50 }), // excellent, good, fair, poor
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDeliveredOrderSchema = createInsertSchema(deliveredOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDeliveredOrderSchema = insertDeliveredOrderSchema.partial();

export type InsertDeliveredOrder = z.infer<typeof insertDeliveredOrderSchema>;
export type UpdateDeliveredOrder = z.infer<typeof updateDeliveredOrderSchema>;
export type DeliveredOrder = typeof deliveredOrders.$inferSelect;

// Events table for admin-scheduled calendar events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(), // "team_practice", "cryotherapy", "language_school", etc.
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  location: text("location"),
  notes: text("notes"),
  participants: text("participants"), // JSON array of player names or "all" for team events
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // "daily", "weekly", "monthly"
  recurringEndDate: text("recurring_end_date"), // YYYY-MM-DD format
  recurringDays: text("recurring_days"), // JSON array for weekly: ["monday", "wednesday"]
  parentEventId: integer("parent_event_id"), // For recurring event instances
  createdBy: text("created_by").notNull(), // Admin who created the event
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  dateIdx: index("events_date_idx").on(table.date),
  eventTypeIdx: index("events_type_idx").on(table.eventType),
  createdByIdx: index("events_created_by_idx").on(table.createdBy),
  dateTypeIdx: index("events_date_type_idx").on(table.date, table.eventType),
}));

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEventSchema = insertEventSchema.partial();

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type Event = typeof events.$inferSelect;

// Event Templates
export const eventTemplates = pgTable("event_templates", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  eventType: varchar("event_type").notNull(),
  duration: integer("duration"), // duration in minutes
  location: varchar("location"),
  notes: text("notes"),
  participants: text("participants"), // JSON string
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventTemplateSchema = createInsertSchema(eventTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEventTemplateSchema = insertEventTemplateSchema.partial();

export type InsertEventTemplate = z.infer<typeof insertEventTemplateSchema>;
export type UpdateEventTemplate = z.infer<typeof updateEventTemplateSchema>;
export type EventTemplate = typeof eventTemplates.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // event_reminder, schedule_change, announcement
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"), // URL to navigate to
  relatedEventId: integer("related_event_id").references(() => events.id),
  scheduledFor: timestamp("scheduled_for"), // for future notifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNotificationSchema = insertNotificationSchema.partial();

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Communication System
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  from_user_id: varchar("from_user_id").notNull(),
  to_user_id: varchar("to_user_id"), // null for team messages
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  message_type: varchar("message_type").default("team"), // team, private
  is_read: boolean("is_read").default(false),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const updateMessageSchema = insertMessageSchema.partial();

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type UpdateMessage = z.infer<typeof updateMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Medical & Health Management
export const medicalRecords = pgTable("medical_records", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  recordType: varchar("record_type").notNull(), // injury, medical_clearance, fitness_assessment
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("active"), // active, resolved, ongoing
  severity: varchar("severity"), // minor, moderate, severe
  dateRecorded: timestamp("date_recorded").defaultNow(),
  dateResolved: timestamp("date_resolved"),
  doctorNotes: text("doctor_notes"),
  restrictions: text("restrictions"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateMedicalRecordSchema = insertMedicalRecordSchema.partial();

export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type UpdateMedicalRecord = z.infer<typeof updateMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Performance Analytics
export const performanceMetrics = pgTable("performance_metrics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  metricType: varchar("metric_type").notNull(), // training_attendance, match_performance, fitness_score
  value: varchar("value").notNull(),
  unit: varchar("unit"),
  notes: text("notes"),
  recordedDate: timestamp("recorded_date").defaultNow(),
  recordedBy: varchar("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});
export const updatePerformanceMetricSchema = insertPerformanceMetricSchema.partial();

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type UpdatePerformanceMetric = z.infer<typeof updatePerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;

// Document Management (Admin Only)
export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  playerId: integer("player_id").references(() => players.id),
  documentType: varchar("document_type").notNull(), // contract, medical_form, consent, insurance
  title: varchar("title").notNull(),
  fileName: varchar("file_name"),
  fileUrl: varchar("file_url"),
  status: varchar("status").default("pending"), // pending, approved, expired, rejected
  expiryDate: timestamp("expiry_date"),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateDocumentSchema = insertDocumentSchema.partial();

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
export type Document = typeof documents.$inferSelect;
