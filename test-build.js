var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chores: () => chores,
  deliveredOrders: () => deliveredOrders,
  documents: () => documents,
  eventTemplates: () => eventTemplates,
  events: () => events,
  excuses: () => excuses,
  groceryOrders: () => groceryOrders,
  insertChoreSchema: () => insertChoreSchema,
  insertDeliveredOrderSchema: () => insertDeliveredOrderSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertEventSchema: () => insertEventSchema,
  insertEventTemplateSchema: () => insertEventTemplateSchema,
  insertExcuseSchema: () => insertExcuseSchema,
  insertFoodOrderSchema: () => insertFoodOrderSchema,
  insertGroceryOrderSchema: () => insertGroceryOrderSchema,
  insertMedicalRecordSchema: () => insertMedicalRecordSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPerformanceMetricSchema: () => insertPerformanceMetricSchema,
  insertPlayerSchema: () => insertPlayerSchema,
  insertPracticeExcuseSchema: () => insertPracticeExcuseSchema,
  medicalRecords: () => medicalRecords,
  messages: () => messages,
  notifications: () => notifications,
  performanceMetrics: () => performanceMetrics,
  players: () => players,
  practiceExcuses: () => practiceExcuses,
  sessions: () => sessions,
  updateChoreSchema: () => updateChoreSchema,
  updateDeliveredOrderSchema: () => updateDeliveredOrderSchema,
  updateDocumentSchema: () => updateDocumentSchema,
  updateEventSchema: () => updateEventSchema,
  updateEventTemplateSchema: () => updateEventTemplateSchema,
  updateExcuseSchema: () => updateExcuseSchema,
  updateFoodOrderSchema: () => updateFoodOrderSchema,
  updateGroceryOrderSchema: () => updateGroceryOrderSchema,
  updateMedicalRecordSchema: () => updateMedicalRecordSchema,
  updateMessageSchema: () => updateMessageSchema,
  updateNotificationSchema: () => updateNotificationSchema,
  updatePerformanceMetricSchema: () => updatePerformanceMetricSchema,
  updatePlayerSchema: () => updatePlayerSchema,
  updatePracticeExcuseSchema: () => updatePracticeExcuseSchema,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var players, insertPlayerSchema, updatePlayerSchema, sessions, users, chores, insertChoreSchema, updateChoreSchema, excuses, insertExcuseSchema, updateExcuseSchema, practiceExcuses, insertPracticeExcuseSchema, updatePracticeExcuseSchema, groceryOrders, insertGroceryOrderSchema, updateGroceryOrderSchema, insertFoodOrderSchema, updateFoodOrderSchema, deliveredOrders, insertDeliveredOrderSchema, updateDeliveredOrderSchema, events, insertEventSchema, updateEventSchema, eventTemplates, insertEventTemplateSchema, updateEventTemplateSchema, notifications, insertNotificationSchema, updateNotificationSchema, messages, insertMessageSchema, updateMessageSchema, medicalRecords, insertMedicalRecordSchema, updateMedicalRecordSchema, performanceMetrics, insertPerformanceMetricSchema, updatePerformanceMetricSchema, documents, insertDocumentSchema, updateDocumentSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    players = pgTable("players", {
      id: serial("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").notNull().unique(),
      dateOfBirth: text("date_of_birth").notNull(),
      age: integer("age"),
      // calculated field for easy filtering
      nationality: text("nationality").notNull(),
      nationalityCode: text("nationality_code"),
      // ISO country code for flag display (e.g., "DE", "BR", "FR")
      positions: jsonb("positions"),
      // JSON array for multiple positions: ["goalkeeper", "defender"]
      position: text("position").notNull(),
      // primary position for backward compatibility
      house: text("house").default("Widdersdorf 1"),
      // Widdersdorf 1, Widdersdorf 2, Widdersdorf 3
      status: text("status").notNull().default("active"),
      // active, on_trial, inactive
      availability: text("availability").notNull().default("available"),
      // available, unavailable, injured, suspended
      availabilityReason: text("availability_reason"),
      // reason for unavailability
      profileImageUrl: text("profile_image_url"),
      phoneNumber: text("phone_number"),
      emergencyContactName: text("emergency_contact_name"),
      emergencyContactPhone: text("emergency_contact_phone"),
      medicalConditions: text("medical_conditions"),
      allergies: text("allergies"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertPlayerSchema = createInsertSchema(players).omit({
      id: true,
      createdAt: true
    }).extend({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      dateOfBirth: z.string().min(1, "Date of birth is required"),
      age: z.number().min(16).max(30).optional(),
      nationality: z.string().min(1, "Nationality is required"),
      nationalityCode: z.string().length(2, "Country code must be 2 characters").optional().or(z.literal("")),
      positions: z.array(z.string()).optional(),
      position: z.string().min(1, "Position is required"),
      house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).default("Widdersdorf 1"),
      status: z.enum(["active", "on_trial", "inactive"]).default("active"),
      availability: z.enum(["available", "unavailable", "injured", "suspended"]).default("available"),
      availabilityReason: z.string().optional(),
      profileImageUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
      phoneNumber: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      medicalConditions: z.string().optional(),
      allergies: z.string().optional(),
      notes: z.string().optional()
    });
    updatePlayerSchema = insertPlayerSchema.partial();
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
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
      role: text("role").notNull().default("player"),
      // admin, player, coach, staff, manager
      status: text("status").notNull().default("pending"),
      // pending, approved, rejected
      house: varchar("house"),
      phoneNumber: varchar("phone_number"),
      emergencyContact: varchar("emergency_contact"),
      emergencyPhone: varchar("emergency_phone"),
      // Additional player fields
      phone: varchar("phone"),
      preferredFoot: varchar("preferred_foot"),
      height: integer("height"),
      // in cm
      weight: integer("weight"),
      // in kg
      previousClub: varchar("previous_club"),
      emergencyContactName: varchar("emergency_contact_name"),
      emergencyContactPhone: varchar("emergency_contact_phone"),
      medicalConditions: text("medical_conditions"),
      allergies: text("allergies"),
      jerseyNumber: integer("jersey_number"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      passwordResetToken: varchar("password_reset_token"),
      passwordResetExpiry: timestamp("password_reset_expiry")
    });
    chores = pgTable("chores", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      // cleaning, trash, maintenance, other
      frequency: text("frequency").notNull(),
      // daily, weekly, monthly
      house: text("house").notNull().default("Widdersdorf 1"),
      // Widdersdorf 1, Widdersdorf 2, Widdersdorf 3
      assignedTo: text("assigned_to"),
      // JSON string array of player IDs/names
      dueDate: text("due_date"),
      startTime: text("start_time"),
      // for calendar integration
      endTime: text("end_time"),
      // for calendar integration
      isRecurring: boolean("is_recurring").default(false),
      recurringPattern: text("recurring_pattern"),
      // daily, weekly, monthly
      status: text("status").notNull().default("pending"),
      // pending, in_progress, completed
      priority: text("priority").notNull().default("medium"),
      // low, medium, high
      createdBy: text("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      completedAt: timestamp("completed_at")
    });
    insertChoreSchema = createInsertSchema(chores).omit({
      id: true,
      createdAt: true,
      completedAt: true
    }).extend({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      category: z.enum(["cleaning", "trash", "maintenance", "other"]),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).default("Widdersdorf 1"),
      assignedTo: z.string().optional(),
      // JSON string array of player names/IDs
      dueDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      isRecurring: z.boolean().default(false),
      recurringPattern: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      createdBy: z.string().min(1, "Creator is required")
    });
    updateChoreSchema = insertChoreSchema.partial();
    excuses = pgTable("excuses", {
      id: serial("id").primaryKey(),
      playerName: text("player_name").notNull(),
      activity: text("activity").notNull(),
      // Team Practice, Cryotherapy, etc.
      reason: text("reason").notNull(),
      status: text("status").notNull().default("pending"),
      // pending, approved, denied
      submittedAt: text("submitted_at").notNull(),
      reviewedBy: text("reviewed_by"),
      reviewedAt: text("reviewed_at"),
      notes: text("notes")
    });
    insertExcuseSchema = createInsertSchema(excuses).omit({
      id: true,
      submittedAt: true,
      reviewedBy: true,
      reviewedAt: true
    });
    updateExcuseSchema = insertExcuseSchema.partial();
    practiceExcuses = excuses;
    insertPracticeExcuseSchema = insertExcuseSchema;
    updatePracticeExcuseSchema = updateExcuseSchema;
    groceryOrders = pgTable("grocery_orders", {
      id: serial("id").primaryKey(),
      playerName: varchar("player_name", { length: 255 }).notNull(),
      weekStartDate: varchar("week_start_date", { length: 50 }).notNull(),
      // Monday of the week
      deliveryDay: varchar("delivery_day", { length: 20 }).notNull(),
      // "monday" or "thursday"
      // Grocery categories
      proteins: text("proteins"),
      // meat, fish, eggs, dairy
      vegetables: text("vegetables"),
      // fresh vegetables
      fruits: text("fruits"),
      // fresh fruits
      grains: text("grains"),
      // bread, pasta, rice, cereals
      snacks: text("snacks"),
      // healthy snacks, protein bars
      beverages: text("beverages"),
      // water, juices, sports drinks
      supplements: text("supplements"),
      // protein powder, vitamins
      specialRequests: text("special_requests"),
      dietaryRestrictions: text("dietary_restrictions"),
      estimatedCost: varchar("estimated_cost", { length: 20 }),
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      // pending, confirmed, delivered, cancelled
      adminNotes: text("admin_notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      playerNameIdx: index("grocery_orders_player_idx").on(table.playerName),
      weekStartIdx: index("grocery_orders_week_idx").on(table.weekStartDate),
      statusIdx: index("grocery_orders_status_idx").on(table.status),
      playerWeekIdx: index("grocery_orders_player_week_idx").on(table.playerName, table.weekStartDate)
    }));
    insertGroceryOrderSchema = createInsertSchema(groceryOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateGroceryOrderSchema = insertGroceryOrderSchema.partial();
    insertFoodOrderSchema = insertGroceryOrderSchema;
    updateFoodOrderSchema = updateGroceryOrderSchema;
    deliveredOrders = pgTable("delivered_orders", {
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
      storageLocation: varchar("storage_location", { length: 255 }),
      // where items are stored
      deliveredBy: varchar("delivered_by", { length: 255 }),
      // staff member who delivered
      receivedBy: varchar("received_by", { length: 255 }),
      // player who received
      deliveryCompletedAt: timestamp("delivery_completed_at").defaultNow(),
      // Quality tracking
      itemCondition: varchar("item_condition", { length: 50 }).default("good"),
      // good, damaged, missing_items
      playerSatisfaction: varchar("player_satisfaction", { length: 50 }),
      // excellent, good, fair, poor
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertDeliveredOrderSchema = createInsertSchema(deliveredOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateDeliveredOrderSchema = insertDeliveredOrderSchema.partial();
    events = pgTable("events", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      eventType: text("event_type").notNull(),
      // "team_practice", "cryotherapy", "language_school", etc.
      date: text("date").notNull(),
      // YYYY-MM-DD format
      startTime: text("start_time").notNull(),
      // HH:MM format
      endTime: text("end_time").notNull(),
      // HH:MM format
      location: text("location"),
      notes: text("notes"),
      participants: text("participants"),
      // JSON array of player names or "all" for team events
      isRecurring: boolean("is_recurring").default(false),
      recurringPattern: text("recurring_pattern"),
      // "daily", "weekly", "monthly"
      recurringEndDate: text("recurring_end_date"),
      // YYYY-MM-DD format
      recurringDays: text("recurring_days"),
      // JSON array for weekly: ["monday", "wednesday"]
      parentEventId: integer("parent_event_id"),
      // For recurring event instances
      createdBy: text("created_by").notNull(),
      // Admin who created the event
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      dateIdx: index("events_date_idx").on(table.date),
      eventTypeIdx: index("events_type_idx").on(table.eventType),
      createdByIdx: index("events_created_by_idx").on(table.createdBy),
      dateTypeIdx: index("events_date_type_idx").on(table.date, table.eventType)
    }));
    insertEventSchema = createInsertSchema(events).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateEventSchema = insertEventSchema.partial();
    eventTemplates = pgTable("event_templates", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      name: varchar("name").notNull(),
      title: varchar("title").notNull(),
      eventType: varchar("event_type").notNull(),
      duration: integer("duration"),
      // duration in minutes
      location: varchar("location"),
      notes: text("notes"),
      participants: text("participants"),
      // JSON string
      createdBy: varchar("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertEventTemplateSchema = createInsertSchema(eventTemplates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateEventTemplateSchema = insertEventTemplateSchema.partial();
    notifications = pgTable("notifications", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      userId: varchar("user_id").notNull(),
      title: varchar("title").notNull(),
      message: text("message").notNull(),
      type: varchar("type").notNull(),
      // event_reminder, schedule_change, announcement
      isRead: boolean("is_read").default(false),
      actionUrl: varchar("action_url"),
      // URL to navigate to
      relatedEventId: integer("related_event_id").references(() => events.id),
      scheduledFor: timestamp("scheduled_for"),
      // for future notifications
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      userIdIdx: index("notifications_user_id_idx").on(table.userId),
      isReadIdx: index("notifications_is_read_idx").on(table.isRead),
      createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
      userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead)
    }));
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateNotificationSchema = insertNotificationSchema.partial();
    messages = pgTable("messages", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      from_user_id: varchar("from_user_id").notNull(),
      to_user_id: varchar("to_user_id"),
      // null for team messages
      subject: varchar("subject").notNull(),
      content: text("content").notNull(),
      message_type: varchar("message_type").default("team"),
      // team, private
      is_read: boolean("is_read").default(false),
      priority: varchar("priority").default("normal"),
      // low, normal, high, urgent
      created_at: timestamp("created_at").defaultNow(),
      updated_at: timestamp("updated_at").defaultNow()
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      created_at: true,
      updated_at: true
    });
    updateMessageSchema = insertMessageSchema.partial();
    medicalRecords = pgTable("medical_records", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      playerId: integer("player_id").references(() => players.id).notNull(),
      recordType: varchar("record_type").notNull(),
      // injury, medical_clearance, fitness_assessment
      title: varchar("title").notNull(),
      description: text("description"),
      status: varchar("status").default("active"),
      // active, resolved, ongoing
      severity: varchar("severity"),
      // minor, moderate, severe
      dateRecorded: timestamp("date_recorded").defaultNow(),
      dateResolved: timestamp("date_resolved"),
      doctorNotes: text("doctor_notes"),
      restrictions: text("restrictions"),
      createdBy: varchar("created_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateMedicalRecordSchema = insertMedicalRecordSchema.partial();
    performanceMetrics = pgTable("performance_metrics", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      playerId: integer("player_id").references(() => players.id).notNull(),
      metricType: varchar("metric_type").notNull(),
      // training_attendance, match_performance, fitness_score
      value: varchar("value").notNull(),
      unit: varchar("unit"),
      notes: text("notes"),
      recordedDate: timestamp("recorded_date").defaultNow(),
      recordedBy: varchar("recorded_by").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
      id: true,
      createdAt: true
    });
    updatePerformanceMetricSchema = insertPerformanceMetricSchema.partial();
    documents = pgTable("documents", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      playerId: integer("player_id").references(() => players.id),
      documentType: varchar("document_type").notNull(),
      // contract, medical_form, consent, insurance
      title: varchar("title").notNull(),
      fileName: varchar("file_name"),
      fileUrl: varchar("file_url"),
      status: varchar("status").default("pending"),
      // pending, approved, expired, rejected
      expiryDate: timestamp("expiry_date"),
      uploadedBy: varchar("uploaded_by").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertDocumentSchema = createInsertSchema(documents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateDocumentSchema = insertDocumentSchema.partial();
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, sql, desc, count, and, or, inArray, gte, lte } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations for authentication
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.email, username));
        return user || void 0;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      async upsertUser(userData) {
        const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
        if (existingUser.length > 0) {
          const [user] = await db.update(users).set({
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            role: userData.role,
            status: userData.status || "pending",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.email, userData.email)).returning();
          return user;
        } else {
          const [user] = await db.insert(users).values(userData).returning();
          return user;
        }
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async getAllUsersWithoutImages() {
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
      async getPendingUsers() {
        return await db.select().from(users).where(eq(users.status, "pending"));
      }
      async approveUser(userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        await db.update(users).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
        await this.syncUserToPlayer(user);
      }
      async rejectUser(userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        await db.delete(users).where(eq(users.id, userId));
      }
      async deleteUser(userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
          throw new Error("User not found");
        }
        if (user.email) {
          await db.delete(players).where(eq(players.email, user.email));
        }
        await db.delete(users).where(eq(users.id, userId));
      }
      async updateUserProfile(userId, profileData) {
        const updateData = {
          updatedAt: /* @__PURE__ */ new Date()
        };
        if (profileData.firstName !== void 0) updateData.firstName = profileData.firstName;
        if (profileData.lastName !== void 0) updateData.lastName = profileData.lastName;
        if (profileData.email !== void 0) updateData.email = profileData.email;
        if (profileData.phone !== void 0) updateData.phone = profileData.phone;
        if (profileData.phoneNumber !== void 0) updateData.phoneNumber = profileData.phoneNumber;
        if (profileData.dateOfBirth !== void 0) updateData.dateOfBirth = profileData.dateOfBirth;
        if (profileData.nationality !== void 0) updateData.nationality = profileData.nationality;
        if (profileData.nationalityCode !== void 0) updateData.nationalityCode = profileData.nationalityCode;
        if (profileData.position !== void 0) updateData.position = profileData.position;
        if (profileData.preferredFoot !== void 0) updateData.preferredFoot = profileData.preferredFoot;
        if (profileData.height !== void 0) updateData.height = profileData.height;
        if (profileData.weight !== void 0) updateData.weight = profileData.weight;
        if (profileData.previousClub !== void 0) updateData.previousClub = profileData.previousClub;
        if (profileData.profileImageUrl !== void 0) updateData.profileImageUrl = profileData.profileImageUrl;
        if (profileData.emergencyContactName !== void 0) updateData.emergencyContactName = profileData.emergencyContactName;
        if (profileData.emergencyContactPhone !== void 0) updateData.emergencyContactPhone = profileData.emergencyContactPhone;
        if (profileData.medicalConditions !== void 0) updateData.medicalConditions = profileData.medicalConditions;
        if (profileData.allergies !== void 0) updateData.allergies = profileData.allergies;
        if (profileData.house !== void 0) updateData.house = profileData.house;
        const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
        if (!updatedUser) {
          throw new Error("User not found");
        }
        return updatedUser;
      }
      // Helper method to sync a user to player database
      async syncUserToPlayer(user) {
        if (!user.email || user.role === "admin") return;
        const [existingPlayer] = await db.select().from(players).where(eq(players.email, user.email));
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
      async syncAllApprovedUsersToPlayers() {
        const approvedUsers = await db.select().from(users).where(eq(users.status, "approved"));
        for (const user of approvedUsers) {
          await this.syncUserToPlayer(user);
        }
      }
      // Player methods
      async getAllPlayers() {
        return await db.select().from(players);
      }
      async getPlayer(id) {
        const [player] = await db.select().from(players).where(eq(players.id, id));
        return player || void 0;
      }
      async createPlayer(insertPlayer) {
        const [player] = await db.insert(players).values(insertPlayer).returning();
        return player;
      }
      async updatePlayer(id, updates) {
        const [player] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
        return player || void 0;
      }
      async updatePlayerByEmail(email, updates) {
        const [player] = await db.update(players).set(updates).where(eq(players.email, email)).returning();
        return player || void 0;
      }
      async deletePlayer(id) {
        const result = await db.delete(players).where(eq(players.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
      }
      async searchPlayers(query) {
        return await db.select().from(players).where(
          sql`${players.firstName} ILIKE ${`%${query}%`} OR 
            ${players.lastName} ILIKE ${`%${query}%`} OR 
            ${players.email} ILIKE ${`%${query}%`}`
        );
      }
      async filterPlayers(filters) {
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
      async getPlayersByHouse(house) {
        return await db.select().from(players).where(eq(players.house, house));
      }
      async getPlayerStats() {
        const allPlayers = await db.select().from(players);
        const uniqueCountries = new Set(allPlayers.map((p) => p.nationality));
        return {
          totalPlayers: allPlayers.length,
          countries: uniqueCountries.size
        };
      }
      // Chore methods
      async getAllChores() {
        return await db.select().from(chores);
      }
      async getChore(id) {
        const [chore] = await db.select().from(chores).where(eq(chores.id, id));
        return chore || void 0;
      }
      async createChore(insertChore) {
        if (!insertChore.title?.trim()) {
          throw new Error("Chore title is required");
        }
        if (!insertChore.createdBy?.trim()) {
          throw new Error("Creator is required");
        }
        const validHouses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
        if (!validHouses.includes(insertChore.house)) {
          throw new Error(`Invalid house. Must be one of: ${validHouses.join(", ")}`);
        }
        if (insertChore.assignedTo) {
          try {
            const assignedPlayers = JSON.parse(insertChore.assignedTo);
            if (Array.isArray(assignedPlayers) && assignedPlayers.length > 0) {
              const housePlayers = await this.getAllPlayers();
              const validPlayers = housePlayers.filter((player) => player.house === insertChore.house).map((player) => `${player.firstName} ${player.lastName}`);
              const invalidAssignments = assignedPlayers.filter(
                (player) => !validPlayers.includes(player)
              );
              if (invalidAssignments.length > 0) {
                throw new Error(`Invalid player assignments for ${insertChore.house}: ${invalidAssignments.join(", ")}`);
              }
            }
          } catch (parseError) {
            if (parseError instanceof SyntaxError) {
              throw new Error("Invalid assignedTo format. Must be valid JSON array");
            }
            throw parseError;
          }
        }
        if (insertChore.dueDate) {
          const dueDate = new Date(insertChore.dueDate);
          if (isNaN(dueDate.getTime())) {
            throw new Error("Invalid due date format");
          }
        }
        try {
          const [chore] = await db.insert(chores).values({
            ...insertChore,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
          if (chore.assignedTo) {
            await this.createNotificationsForAssignees(
              chore.assignedTo,
              `New Chore Assigned: ${chore.title}`,
              `You have been assigned a new chore in ${chore.house}. Due: ${chore.dueDate}`,
              "chore",
              "/chores"
            );
          }
          return chore;
        } catch (error) {
          console.error("Database error creating chore:", error);
          throw new Error("Failed to create chore due to database error");
        }
      }
      async updateChore(id, updates) {
        const [chore] = await db.update(chores).set(updates).where(eq(chores.id, id)).returning();
        return chore || void 0;
      }
      async deleteChore(id) {
        const result = await db.delete(chores).where(eq(chores.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
      }
      async getChoresByHouse(house) {
        return await db.select().from(chores).where(eq(chores.house, house));
      }
      async getChoresForUser(username) {
        return await db.select().from(chores).where(
          sql`${chores.assignedTo} = ${username}`
        );
      }
      async getChoresForUserByName(fullName) {
        return await db.select().from(chores).where(
          sql`${chores.assignedTo} = ${fullName}`
        );
      }
      async getChoreStats() {
        const total = await db.select({ count: sql`count(*)` }).from(chores);
        const pending = await db.select({ count: sql`count(*)` }).from(chores).where(eq(chores.status, "pending"));
        const completed = await db.select({ count: sql`count(*)` }).from(chores).where(eq(chores.status, "completed"));
        return {
          totalChores: total[0]?.count || 0,
          pendingChores: pending[0]?.count || 0,
          completedChores: completed[0]?.count || 0,
          overdueChores: 0
          // We'll implement this based on due dates later
        };
      }
      // Practice excuse methods
      async getAllPracticeExcuses() {
        return await db.select().from(practiceExcuses);
      }
      async getPracticeExcuse(id) {
        const [excuse] = await db.select().from(practiceExcuses).where(eq(practiceExcuses.id, id));
        return excuse || void 0;
      }
      async createPracticeExcuse(insertExcuse) {
        const excuseWithTimestamp = {
          ...insertExcuse,
          submittedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const [excuse] = await db.insert(practiceExcuses).values(excuseWithTimestamp).returning();
        return excuse;
      }
      async updatePracticeExcuse(id, updates) {
        const [excuse] = await db.update(practiceExcuses).set(updates).where(eq(practiceExcuses.id, id)).returning();
        return excuse || void 0;
      }
      async deletePracticeExcuse(id) {
        const result = await db.delete(practiceExcuses).where(eq(practiceExcuses.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
      }
      async getPracticeExcusesByPlayer(playerName) {
        return await db.select().from(practiceExcuses).where(eq(practiceExcuses.playerName, playerName));
      }
      async getPracticeExcusesByDate(date) {
        return await db.select().from(practiceExcuses).where(sql`submitted_at LIKE ${date + "%"}`);
      }
      // New generalized excuse methods
      async getAllExcuses() {
        const allExcuses = await db.select().from(excuses).orderBy(desc(excuses.submittedAt));
        return allExcuses;
      }
      async getExcuse(id) {
        const [excuse] = await db.select().from(excuses).where(eq(excuses.id, id));
        return excuse;
      }
      async createExcuse(insertExcuse) {
        const [excuse] = await db.insert(excuses).values({
          ...insertExcuse,
          submittedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        return excuse;
      }
      async updateExcuse(id, updates) {
        const [excuse] = await db.update(excuses).set(updates).where(eq(excuses.id, id)).returning();
        return excuse;
      }
      async deleteExcuse(id) {
        const result = await db.delete(excuses).where(eq(excuses.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
      }
      async getExcusesByPlayer(playerName) {
        const playerExcuses = await db.select().from(excuses).where(eq(excuses.playerName, playerName)).orderBy(desc(excuses.submittedAt));
        return playerExcuses;
      }
      async getExcusesByDate(date) {
        const dateExcuses = await db.select().from(excuses).where(sql`submitted_at LIKE ${date + "%"}`).orderBy(desc(excuses.submittedAt));
        return dateExcuses;
      }
      async getExcuseStats() {
        const total = await db.select({ count: sql`count(*)` }).from(excuses);
        const pending = await db.select({ count: sql`count(*)` }).from(excuses).where(eq(excuses.status, "pending"));
        const approved = await db.select({ count: sql`count(*)` }).from(excuses).where(eq(excuses.status, "approved"));
        const denied = await db.select({ count: sql`count(*)` }).from(excuses).where(eq(excuses.status, "denied"));
        const allExcuses = await this.getAllExcuses();
        const excusesByReason = {};
        allExcuses.forEach((excuse) => {
          const category = this.categorizeReason(excuse.reason);
          excusesByReason[category] = (excusesByReason[category] || 0) + 1;
        });
        return {
          totalExcuses: total[0]?.count || 0,
          pendingExcuses: pending[0]?.count || 0,
          approvedExcuses: approved[0]?.count || 0,
          deniedExcuses: denied[0]?.count || 0,
          excusesByReason
        };
      }
      // Legacy practice excuse methods (for backward compatibility)
      async getPracticeExcuseStats() {
        return this.getExcuseStats();
      }
      categorizeReason(reason) {
        const lowerReason = reason.toLowerCase();
        if (lowerReason.includes("sick") || lowerReason.includes("ill") || lowerReason.includes("health")) {
          return "Medical";
        } else if (lowerReason.includes("family") || lowerReason.includes("emergency")) {
          return "Family/Emergency";
        } else if (lowerReason.includes("school") || lowerReason.includes("exam") || lowerReason.includes("university")) {
          return "Academic";
        } else if (lowerReason.includes("work") || lowerReason.includes("job")) {
          return "Work";
        } else if (lowerReason.includes("injury") || lowerReason.includes("hurt")) {
          return "Injury";
        } else {
          return "Other";
        }
      }
      // Grocery order methods
      async getAllFoodOrders() {
        return await db.select().from(groceryOrders);
      }
      async getFoodOrder(id) {
        const [order] = await db.select().from(groceryOrders).where(eq(groceryOrders.id, id));
        return order;
      }
      async createFoodOrder(insertOrder) {
        if (!insertOrder.playerName?.trim()) {
          throw new Error("Player name is required");
        }
        if (!insertOrder.weekStartDate) {
          throw new Error("Week start date is required");
        }
        const weekStart = new Date(insertOrder.weekStartDate);
        if (isNaN(weekStart.getTime())) {
          throw new Error("Invalid week start date format");
        }
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        if (weekStart < today) {
          throw new Error("Cannot create orders for past weeks");
        }
        const existingOrder = await db.select().from(groceryOrders).where(and(
          eq(groceryOrders.playerName, insertOrder.playerName),
          eq(groceryOrders.weekStartDate, insertOrder.weekStartDate),
          sql`${groceryOrders.status} != 'cancelled'`
        )).limit(1);
        if (existingOrder.length > 0) {
          throw new Error(`Order already exists for ${insertOrder.playerName} for week starting ${insertOrder.weekStartDate}`);
        }
        try {
          const [order] = await db.insert(groceryOrders).values({
            ...insertOrder,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return order;
        } catch (error) {
          console.error("Database error creating food order:", error);
          throw new Error("Failed to create food order due to database error");
        }
      }
      async updateFoodOrder(id, updates) {
        const [order] = await db.update(groceryOrders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(groceryOrders.id, id)).returning();
        return order;
      }
      async deleteFoodOrder(id) {
        const result = await db.delete(groceryOrders).where(eq(groceryOrders.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getFoodOrdersByPlayer(playerName) {
        return await db.select().from(groceryOrders).where(eq(groceryOrders.playerName, playerName));
      }
      async getFoodOrdersByDate(date) {
        return await db.select().from(groceryOrders).where(eq(groceryOrders.weekStartDate, date));
      }
      async getFoodOrderStats() {
        const orders = await this.getAllFoodOrders();
        const activeOrders = orders.filter((order) => order.status !== "cancelled");
        return {
          totalOrders: activeOrders.length,
          pendingOrders: activeOrders.filter((order) => order.status === "pending").length,
          confirmedOrders: activeOrders.filter((order) => order.status === "confirmed").length,
          deliveredOrders: activeOrders.filter((order) => order.status === "delivered").length,
          cancelledOrders: 0
          // Hide cancelled count entirely
        };
      }
      filterOrdersByDate(orders, dateFilter) {
        const activeOrders = orders.filter((order) => order.status !== "cancelled");
        if (!dateFilter || dateFilter === "all") {
          return activeOrders;
        }
        const now = /* @__PURE__ */ new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return activeOrders.filter((order) => {
          const orderDate = new Date(order.weekStartDate);
          switch (dateFilter) {
            case "current-week":
              const nextWeek = new Date(currentWeekStart);
              nextWeek.setDate(currentWeekStart.getDate() + 7);
              return orderDate >= currentWeekStart && orderDate < nextWeek;
            case "current-month":
              const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              return orderDate >= currentMonthStart && orderDate < nextMonth;
            case "last-month":
              return orderDate >= lastMonthStart && orderDate < currentMonthStart;
            case "last-3-months":
              return orderDate >= threeMonthsAgo;
            default:
              return true;
          }
        });
      }
      async getHouseOrderSummary(dateFilter) {
        if (dateFilter && dateFilter !== "all") {
          const validFilters = ["current-week", "current-month", "last-month", "last-3-months"];
          if (!validFilters.includes(dateFilter)) {
            throw new Error(`Invalid date filter: ${dateFilter}`);
          }
        }
        const [allPlayers, allOrders] = await Promise.all([
          this.getAllPlayers(),
          this.getAllFoodOrders()
        ]);
        const playerHouseMap = /* @__PURE__ */ new Map();
        allPlayers.forEach((player) => {
          const fullName = `${player.firstName} ${player.lastName}`;
          playerHouseMap.set(fullName, player.house || "Unassigned");
        });
        const filteredOrders = this.filterOrdersByDate(allOrders, dateFilter);
        const houseSummary = {};
        filteredOrders.forEach((order) => {
          const playerHouse = playerHouseMap.get(order.playerName) || "Unassigned";
          if (!houseSummary[playerHouse]) {
            houseSummary[playerHouse] = {
              totalOrders: 0,
              players: /* @__PURE__ */ new Set(),
              orderDetails: [],
              consolidatedItems: {
                proteins: /* @__PURE__ */ new Set(),
                vegetables: /* @__PURE__ */ new Set(),
                fruits: /* @__PURE__ */ new Set(),
                grains: /* @__PURE__ */ new Set(),
                snacks: /* @__PURE__ */ new Set(),
                beverages: /* @__PURE__ */ new Set(),
                supplements: /* @__PURE__ */ new Set()
              }
            };
          }
          houseSummary[playerHouse].totalOrders++;
          houseSummary[playerHouse].players.add(order.playerName);
          houseSummary[playerHouse].orderDetails.push(order);
          if (order.proteins) {
            order.proteins.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.proteins.add(item.trim())
            );
          }
          if (order.vegetables) {
            order.vegetables.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.vegetables.add(item.trim())
            );
          }
          if (order.fruits) {
            order.fruits.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.fruits.add(item.trim())
            );
          }
          if (order.grains) {
            order.grains.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.grains.add(item.trim())
            );
          }
          if (order.snacks) {
            order.snacks.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.snacks.add(item.trim())
            );
          }
          if (order.beverages) {
            order.beverages.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.beverages.add(item.trim())
            );
          }
          if (order.supplements) {
            order.supplements.split(", ").forEach(
              (item) => item.trim() && houseSummary[playerHouse].consolidatedItems.supplements.add(item.trim())
            );
          }
        });
        Object.keys(houseSummary).forEach((house) => {
          houseSummary[house].players = Array.from(houseSummary[house].players);
          Object.keys(houseSummary[house].consolidatedItems).forEach((category) => {
            houseSummary[house].consolidatedItems[category] = Array.from(houseSummary[house].consolidatedItems[category]);
          });
        });
        return houseSummary;
      }
      // Event methods (admin-only)
      async getAllEvents() {
        const eventList = await db.select().from(events);
        return eventList;
      }
      async getEvent(id) {
        const [event] = await db.select().from(events).where(eq(events.id, id));
        return event || void 0;
      }
      async createEvent(insertEvent) {
        const [event] = await db.insert(events).values({
          ...insertEvent,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        if (event.participants && !event.participants.toLowerCase().includes("all players") && !event.participants.toLowerCase().includes("entire team")) {
          await this.createNotificationsForAssignees(
            event.participants,
            `New Event: ${event.title}`,
            `You have been assigned to "${event.title}" on ${event.date} at ${event.startTime}. Location: ${event.location || "TBD"}`,
            "event",
            "/calendar"
          );
        }
        return event;
      }
      async updateEvent(id, updates) {
        const [event] = await db.update(events).set({
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(events.id, id)).returning();
        return event || void 0;
      }
      async deleteEvent(id) {
        const result = await db.delete(events).where(eq(events.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getEventsByDate(date) {
        const eventList = await db.select().from(events).where(eq(events.date, date));
        return eventList;
      }
      async getEventsByDateRange(startDate, endDate) {
        const eventList = await db.select().from(events).where(sql`date >= ${startDate} AND date <= ${endDate}`).orderBy(events.date, events.startTime);
        return eventList;
      }
      // Communication methods
      async getAllMessages() {
        return await db.select().from(messages).orderBy(desc(messages.created_at));
      }
      async getMessage(id) {
        const [message] = await db.select().from(messages).where(eq(messages.id, id));
        return message;
      }
      async createMessage(messageData) {
        const dbData = {
          from_user_id: messageData.senderId || messageData.from_user_id,
          to_user_id: messageData.recipientId || messageData.to_user_id,
          subject: messageData.senderName || messageData.subject || "Message",
          content: messageData.content,
          message_type: messageData.messageType || messageData.message_type || "team",
          is_read: messageData.isRead || false,
          priority: messageData.priority || "normal",
          created_at: /* @__PURE__ */ new Date(),
          updated_at: /* @__PURE__ */ new Date()
        };
        const [message] = await db.insert(messages).values(dbData).returning();
        return message;
      }
      async updateMessage(id, updates) {
        const [message] = await db.update(messages).set({ ...updates, updated_at: /* @__PURE__ */ new Date() }).where(eq(messages.id, id)).returning();
        return message;
      }
      async deleteMessage(id) {
        const result = await db.delete(messages).where(eq(messages.id, id));
        return (result.rowCount || 0) > 0;
      }
      async deleteAllTeamMessages() {
        const result = await db.delete(messages).where(eq(messages.message_type, "team"));
        return result.rowCount || 0;
      }
      async getMessagesByUser(userId) {
        return await db.select().from(messages).where(or(eq(messages.from_user_id, userId), eq(messages.to_user_id, userId))).orderBy(desc(messages.created_at));
      }
      async markMessageAsRead(messageId) {
        await db.update(messages).set({ is_read: true, updated_at: /* @__PURE__ */ new Date() }).where(eq(messages.id, messageId));
      }
      // Medical records methods - temporary implementation
      async getAllMedicalRecords() {
        return [];
      }
      async getMedicalRecord(id) {
        return void 0;
      }
      async createMedicalRecord(recordData) {
        return { id: Date.now(), ...recordData, createdAt: /* @__PURE__ */ new Date() };
      }
      async updateMedicalRecord(id, updates) {
        return void 0;
      }
      async deleteMedicalRecord(id) {
        return true;
      }
      async getMedicalRecordsByPlayer(playerId) {
        return [];
      }
      async getRecentActivities() {
        try {
          const sevenDaysAgo = /* @__PURE__ */ new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const activities = [];
          const recentPlayers = await db.select().from(players).where(gte(players.createdAt, sevenDaysAgo)).orderBy(desc(players.createdAt)).limit(5);
          for (const player of recentPlayers) {
            activities.push({
              id: `player-${player.id}`,
              type: "player_registered",
              message: "New player registered",
              description: `${player.firstName} ${player.lastName} joined ${player.house}`,
              createdAt: player.createdAt,
              playerName: `${player.firstName} ${player.lastName}`
            });
          }
          const recentOrders = await db.select().from(groceryOrders).where(gte(groceryOrders.createdAt, sevenDaysAgo)).orderBy(desc(groceryOrders.createdAt)).limit(5);
          for (const order of recentOrders) {
            activities.push({
              id: `order-${order.id}`,
              type: "food_order",
              message: "New grocery order placed",
              description: `Order for ${order.deliveryDay} delivery`,
              createdAt: order.createdAt,
              playerName: order.playerName
            });
          }
          const recentEvents = await db.select().from(events).where(gte(events.createdAt, sevenDaysAgo)).orderBy(desc(events.createdAt)).limit(5);
          for (const event of recentEvents) {
            activities.push({
              id: `event-${event.id}`,
              type: "event_created",
              message: "New event scheduled",
              description: `${event.title} on ${event.date}`,
              createdAt: event.createdAt,
              playerName: "Admin"
            });
          }
          const recentMessages = await db.select().from(messages).where(gte(messages.created_at, sevenDaysAgo)).orderBy(desc(messages.created_at)).limit(5);
          for (const message of recentMessages) {
            activities.push({
              id: `message-${message.id}`,
              type: "message_sent",
              message: "New message sent",
              description: `Message in ${message.message_type} chat`,
              createdAt: message.created_at,
              playerName: message.from_user_id
            });
          }
          const sortedActivities = activities.filter((activity) => activity.createdAt).sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : /* @__PURE__ */ new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : /* @__PURE__ */ new Date(0);
            return dateB.getTime() - dateA.getTime();
          }).slice(0, 10);
          return sortedActivities;
        } catch (error) {
          console.error("Error fetching recent activities:", error);
          return [];
        }
      }
      // Performance metrics methods - temporary implementation
      async getAllPerformanceMetrics() {
        return [];
      }
      async getPerformanceMetric(id) {
        return void 0;
      }
      async createPerformanceMetric(metricData) {
        return { id: Date.now(), ...metricData, createdAt: /* @__PURE__ */ new Date() };
      }
      async updatePerformanceMetric(id, updates) {
        return void 0;
      }
      async deletePerformanceMetric(id) {
        return true;
      }
      async getPerformanceMetricsByPlayer(playerId) {
        return [];
      }
      // Document management methods - temporary implementation
      async getAllDocuments() {
        return [];
      }
      async getDocument(id) {
        return void 0;
      }
      async createDocument(documentData) {
        return { id: Date.now(), ...documentData, createdAt: /* @__PURE__ */ new Date() };
      }
      async updateDocument(id, updates) {
        return void 0;
      }
      async deleteDocument(id) {
        return true;
      }
      async getDocumentsByPlayer(playerId) {
        return [];
      }
      // Event Templates implementation
      async getAllEventTemplates() {
        const results = await db.select().from(eventTemplates).orderBy(eventTemplates.name);
        return results;
      }
      async getEventTemplate(id) {
        const [template] = await db.select().from(eventTemplates).where(eq(eventTemplates.id, id));
        return template;
      }
      async createEventTemplate(insertTemplate) {
        const [template] = await db.insert(eventTemplates).values(insertTemplate).returning();
        return template;
      }
      async updateEventTemplate(id, updates) {
        const [template] = await db.update(eventTemplates).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(eventTemplates.id, id)).returning();
        return template;
      }
      async deleteEventTemplate(id) {
        const result = await db.delete(eventTemplates).where(eq(eventTemplates.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getEventTemplatesByUser(userId) {
        const results = await db.select().from(eventTemplates).where(eq(eventTemplates.createdBy, userId)).orderBy(eventTemplates.name);
        return results;
      }
      // Notifications implementation
      async getAllNotifications() {
        const results = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
        return results;
      }
      async getNotification(id) {
        const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
        return notification;
      }
      async createNotification(insertNotification) {
        const [notification] = await db.insert(notifications).values(insertNotification).returning();
        return notification;
      }
      async updateNotification(id, updates) {
        const [notification] = await db.update(notifications).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notifications.id, id)).returning();
        return notification;
      }
      async deleteNotification(id) {
        const result = await db.delete(notifications).where(eq(notifications.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getNotificationsByUser(userId) {
        const results = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        return results;
      }
      async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notifications.id, notificationId));
      }
      async getUnreadNotificationCount(userId) {
        const result = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
        return result[0]?.count || 0;
      }
      // Notification cleanup for long-term scalability
      async cleanupOldNotifications() {
        const thirtyDaysAgo = /* @__PURE__ */ new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await db.delete(notifications).where(and(
          eq(notifications.isRead, true),
          sql`${notifications.createdAt} < ${thirtyDaysAgo.toISOString()}`
        ));
        return { deletedCount: result.rowCount || 0 };
      }
      async cleanupOldUnreadNotifications() {
        const ninetyDaysAgo = /* @__PURE__ */ new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const result = await db.delete(notifications).where(and(
          eq(notifications.isRead, false),
          sql`${notifications.createdAt} < ${ninetyDaysAgo.toISOString()}`
        ));
        return { deletedCount: result.rowCount || 0 };
      }
      // Bulk operations implementation
      async bulkUpdateEvents(eventIds, updates) {
        const results = await db.update(events).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(inArray(events.id, eventIds)).returning();
        return results;
      }
      async bulkDeleteEvents(eventIds) {
        const result = await db.delete(events).where(inArray(events.id, eventIds));
        return (result.rowCount || 0) > 0;
      }
      // Helper method to create notifications for assigned players
      async createNotificationsForAssignees(assignedTo, title, message, type, actionUrl) {
        if (!assignedTo) return;
        try {
          const assignedPlayers = JSON.parse(assignedTo);
          if (Array.isArray(assignedPlayers)) {
            for (const playerName of assignedPlayers) {
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
          const assigneeNames = assignedTo.split(",").map((name) => name.trim());
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
      async getAllDeliveredOrders() {
        return await db.select().from(deliveredOrders).orderBy(desc(deliveredOrders.deliveryCompletedAt));
      }
      async getDeliveredOrder(id) {
        const [order] = await db.select().from(deliveredOrders).where(eq(deliveredOrders.id, id));
        return order;
      }
      async createDeliveredOrder(insertOrder) {
        const [order] = await db.insert(deliveredOrders).values(insertOrder).returning();
        return order;
      }
      async updateDeliveredOrder(id, updates) {
        const [order] = await db.update(deliveredOrders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deliveredOrders.id, id)).returning();
        return order;
      }
      async deleteDeliveredOrder(id) {
        const result = await db.delete(deliveredOrders).where(eq(deliveredOrders.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getDeliveredOrdersByPlayer(playerName) {
        return await db.select().from(deliveredOrders).where(eq(deliveredOrders.playerName, playerName)).orderBy(desc(deliveredOrders.deliveryCompletedAt));
      }
      async getDeliveredOrdersByDateRange(startDate, endDate) {
        return await db.select().from(deliveredOrders).where(
          and(
            gte(deliveredOrders.deliveryCompletedAt, new Date(startDate)),
            lte(deliveredOrders.deliveryCompletedAt, new Date(endDate))
          )
        ).orderBy(desc(deliveredOrders.deliveryCompletedAt));
      }
      async getDeliveredOrderStats() {
        const now = /* @__PURE__ */ new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const allDeliveries = await db.select().from(deliveredOrders);
        const weekDeliveries = await db.select().from(deliveredOrders).where(gte(deliveredOrders.deliveryCompletedAt, startOfWeek));
        const monthDeliveries = await db.select().from(deliveredOrders).where(gte(deliveredOrders.deliveryCompletedAt, startOfMonth));
        const totalCosts = allDeliveries.filter((order) => order.actualCost).map((order) => parseFloat(order.actualCost || "0"));
        const averageCost = totalCosts.length > 0 ? totalCosts.reduce((sum, cost) => sum + cost, 0) / totalCosts.length : 0;
        const storageLocations = allDeliveries.filter((order) => order.storageLocation).reduce((acc, order) => {
          const location = order.storageLocation;
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {});
        const topStorageLocations = Object.entries(storageLocations).sort(([, a], [, b]) => b - a).slice(0, 5).map(([location]) => location);
        return {
          totalDeliveries: allDeliveries.length,
          deliveriesThisWeek: weekDeliveries.length,
          deliveriesThisMonth: monthDeliveries.length,
          averageCost: Math.round(averageCost * 100) / 100,
          topStorageLocations
        };
      }
      // Password reset methods
      async generatePasswordResetToken(email) {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, email));
          if (!user) {
            return null;
          }
          const token = __require("crypto").randomBytes(32).toString("hex");
          const expiry = new Date(Date.now() + 60 * 60 * 1e3);
          await db.update(users).set({
            passwordResetToken: token,
            passwordResetExpiry: expiry,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, user.id));
          return token;
        } catch (error) {
          console.error("Error generating password reset token:", error);
          return null;
        }
      }
      async validatePasswordResetToken(token) {
        try {
          const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
          if (!user || !user.passwordResetExpiry) {
            return null;
          }
          if (/* @__PURE__ */ new Date() > user.passwordResetExpiry) {
            await db.update(users).set({
              passwordResetToken: null,
              passwordResetExpiry: null,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(users.id, user.id));
            return null;
          }
          return user;
        } catch (error) {
          console.error("Error validating password reset token:", error);
          return null;
        }
      }
      async updatePassword(userId, newPassword) {
        try {
          await db.update(users).set({
            password: newPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, userId));
        } catch (error) {
          console.error("Error updating password:", error);
          throw error;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/choreRotation.ts
var choreRotation_exports = {};
__export(choreRotation_exports, {
  SmartChoreRotationEngine: () => SmartChoreRotationEngine,
  choreRotationEngine: () => choreRotationEngine
});
var SmartChoreRotationEngine, choreRotationEngine;
var init_choreRotation = __esm({
  "server/choreRotation.ts"() {
    "use strict";
    init_storage();
    SmartChoreRotationEngine = class {
      config;
      constructor(config = {
        rotationFrequency: "weekly",
        fairnessWeight: 0.6,
        skillWeight: 0.2,
        availabilityWeight: 0.2
      }) {
        this.config = config;
      }
      // Calculate fairness score for a player (lower = more fair to assign)
      calculateFairnessScore(history, houseAverage) {
        const choreLoad = history.totalChoresAssigned || 0;
        const fairnessGap = choreLoad - houseAverage;
        const daysSinceLastChore = history.lastChoreDate ? (Date.now() - history.lastChoreDate.getTime()) / (1e3 * 60 * 60 * 24) : 30;
        const timeFactor = Math.min(daysSinceLastChore / 7, 1);
        return fairnessGap - timeFactor * 2;
      }
      // Calculate skill score for a chore type
      calculateSkillScore(history, choreType) {
        const typeExperience = history.choreTypes[choreType] || 0;
        const totalExperience = history.totalChoresCompleted || 1;
        const completionRate = history.completionRate || 0;
        return typeExperience / totalExperience * completionRate * history.averageRating;
      }
      // Get optimal chore assignments for a house
      async getOptimalChoreAssignments(house, choreTypes) {
        try {
          const players2 = await storage.getPlayersByHouse(house);
          const playerHistories = await Promise.all(
            players2.map((player) => this.getPlayerChoreHistory(player.id.toString()))
          );
          const totalChores = playerHistories.reduce((sum, h) => sum + h.totalChoresAssigned, 0);
          const houseAverage = totalChores / Math.max(playerHistories.length, 1);
          const assignments = [];
          const explanation = [];
          for (const choreType of choreTypes) {
            let bestPlayer = null;
            let bestScore = Infinity;
            let scoreBreakdown = "";
            for (const history of playerHistories) {
              if (assignments.some((a) => a.playerId === history.playerId)) {
                continue;
              }
              const fairnessScore = this.calculateFairnessScore(history, houseAverage);
              const skillScore = this.calculateSkillScore(history, choreType);
              const availabilityScore = 1;
              const totalScore = fairnessScore * this.config.fairnessWeight + -skillScore * this.config.skillWeight + // Negative because higher skill is better
              -availabilityScore * this.config.availabilityWeight;
              if (totalScore < bestScore) {
                bestScore = totalScore;
                bestPlayer = history;
                scoreBreakdown = `Fairness: ${fairnessScore.toFixed(2)}, Skill: ${skillScore.toFixed(2)}, Total: ${totalScore.toFixed(2)}`;
              }
            }
            if (bestPlayer) {
              assignments.push({
                choreType,
                playerId: bestPlayer.playerId,
                playerName: bestPlayer.playerName,
                score: bestScore
              });
              explanation.push(
                `${choreType} \u2192 ${bestPlayer.playerName}: ${scoreBreakdown}`
              );
            }
          }
          return { assignments, explanation };
        } catch (error) {
          console.error("Error calculating optimal chore assignments:", error);
          throw new Error("Failed to calculate chore assignments");
        }
      }
      // Get comprehensive chore history for a player
      async getPlayerChoreHistory(playerId) {
        try {
          const player = await storage.getPlayer(parseInt(playerId));
          if (!player) {
            throw new Error(`Player ${playerId} not found`);
          }
          const playerChores = await storage.getChoresForUser(player.firstName + " " + player.lastName);
          const completedChores = playerChores.filter((c) => c.status === "completed");
          const totalAssigned = playerChores.length;
          const totalCompleted = completedChores.length;
          const completionRate = totalAssigned > 0 ? totalCompleted / totalAssigned : 0;
          const choreTypes = {};
          playerChores.forEach((chore) => {
            const type = chore.title.toLowerCase();
            choreTypes[type] = (choreTypes[type] || 0) + 1;
          });
          const averageRating = completionRate > 0.8 ? 5 : completionRate > 0.6 ? 4 : completionRate > 0.4 ? 3 : 2;
          const sortedChores = playerChores.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          const lastChoreDate = sortedChores.length > 0 ? new Date(sortedChores[0].createdAt || 0) : null;
          return {
            playerId,
            playerName: `${player.firstName} ${player.lastName}`,
            house: player.house || "",
            totalChoresCompleted: totalCompleted,
            totalChoresAssigned: totalAssigned,
            completionRate,
            lastChoreDate,
            choreTypes,
            averageRating
          };
        } catch (error) {
          console.error(`Error getting chore history for player ${playerId}:`, error);
          return {
            playerId,
            playerName: "Unknown Player",
            house: "",
            totalChoresCompleted: 0,
            totalChoresAssigned: 0,
            completionRate: 0,
            lastChoreDate: null,
            choreTypes: {},
            averageRating: 3
          };
        }
      }
      // Generate automatic chore assignments for all houses
      async generateWeeklyChoreAssignments() {
        const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
        const standardChores = [
          "Kitchen Cleaning",
          "Vacuum Common Areas",
          "Bathroom Cleaning",
          "Take Out Trash",
          "Laundry Room Maintenance"
        ];
        const results = {};
        for (const house of houses) {
          try {
            const houseAssignments = await this.getOptimalChoreAssignments(house, standardChores);
            results[house] = houseAssignments;
          } catch (error) {
            console.error(`Error generating assignments for ${house}:`, error);
            results[house] = { assignments: [], explanation: ["Error generating assignments"] };
          }
        }
        return results;
      }
      // Get fairness report for all houses
      async getFairnessReport() {
        const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
        const houseReports = {};
        let totalFairness = 0;
        for (const house of houses) {
          try {
            const players2 = await storage.getPlayersByHouse(house);
            const playerStats = await Promise.all(
              players2.map((p) => this.getPlayerChoreHistory(p.id.toString()))
            );
            const workloads = playerStats.map((p) => p.totalChoresAssigned);
            const average = workloads.reduce((a, b) => a + b, 0) / Math.max(workloads.length, 1);
            const variance = workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / Math.max(workloads.length, 1);
            const fairnessScore = Math.max(0, 100 - variance * 10);
            const recommendations = [];
            const maxWorkload = Math.max(...workloads);
            const minWorkload = Math.min(...workloads);
            if (maxWorkload - minWorkload > 3) {
              const overworked = playerStats.find((p) => p.totalChoresAssigned === maxWorkload);
              const underworked = playerStats.find((p) => p.totalChoresAssigned === minWorkload);
              recommendations.push(
                `Consider assigning fewer chores to ${overworked?.playerName} and more to ${underworked?.playerName}`
              );
            }
            const lowPerformers = playerStats.filter((p) => p.completionRate < 0.5 && p.totalChoresAssigned > 0);
            if (lowPerformers.length > 0) {
              recommendations.push(
                `Players with low completion rates need support: ${lowPerformers.map((p) => p.playerName).join(", ")}`
              );
            }
            houseReports[house] = {
              fairnessScore,
              playerStats,
              recommendations
            };
            totalFairness += fairnessScore;
          } catch (error) {
            console.error(`Error generating fairness report for ${house}:`, error);
            houseReports[house] = {
              fairnessScore: 0,
              playerStats: [],
              recommendations: ["Error generating report"]
            };
          }
        }
        return {
          overallFairness: totalFairness / houses.length,
          houseReports
        };
      }
    };
    choreRotationEngine = new SmartChoreRotationEngine();
  }
});

// server/houseCompetition.ts
var houseCompetition_exports = {};
__export(houseCompetition_exports, {
  HouseCompetitionEngine: () => HouseCompetitionEngine,
  houseCompetition: () => houseCompetition
});
var HouseCompetitionEngine, houseCompetition;
var init_houseCompetition = __esm({
  "server/houseCompetition.ts"() {
    "use strict";
    init_storage();
    HouseCompetitionEngine = class {
      // Point values for different activities
      pointSystem = {
        choreCompletion: {
          completed: 10,
          completedEarly: 15,
          perfectWeek: 50
          // All chores completed by all house members
        },
        punctuality: {
          onTime: 5,
          early: 10,
          attendance: 15
          // Perfect attendance for a week
        },
        teamwork: {
          helpingOthers: 20,
          groupProject: 25,
          conflictResolution: 30
        },
        cleanliness: {
          dailyUpkeep: 5,
          deepClean: 15,
          inspection: 25
          // Passing surprise cleanliness inspection
        },
        participation: {
          volunteerEvent: 20,
          communityService: 30,
          culturalActivity: 15
        }
      };
      // Calculate chore completion scores for a house
      async calculateChoreCompletionScore(house, timeframe) {
        try {
          const startDate = timeframe === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
          const houseChores = await storage.getChoresByHouse(house);
          const recentChores = houseChores.filter(
            (chore) => new Date(chore.createdAt || 0) >= startDate
          );
          if (recentChores.length === 0) return 0;
          const completedChores = recentChores.filter((chore) => chore.status === "completed");
          const completionRate = completedChores.length / recentChores.length;
          let points = Math.floor(completionRate * 100);
          const earlyCompletions = completedChores.filter((chore) => {
            if (!chore.dueDate || !chore.updatedAt) return false;
            return new Date(chore.updatedAt) < new Date(chore.dueDate);
          });
          points += earlyCompletions.length * this.pointSystem.choreCompletion.completedEarly;
          if (timeframe === "week" && completionRate === 1) {
            points += this.pointSystem.choreCompletion.perfectWeek;
          }
          return points;
        } catch (error) {
          console.error(`Error calculating chore completion score for ${house}:`, error);
          return 0;
        }
      }
      // Calculate punctuality scores based on event attendance
      async calculatePunctualityScore(house, timeframe) {
        try {
          const startDate = timeframe === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
          const events2 = await storage.getAllEvents();
          const recentEvents = events2.filter(
            (event) => new Date(event.date) >= startDate
          );
          const houseEvents = recentEvents.filter(
            (event) => event.participants?.includes(house) || event.participants?.toLowerCase().includes("all")
          );
          return houseEvents.length * this.pointSystem.punctuality.attendance;
        } catch (error) {
          console.error(`Error calculating punctuality score for ${house}:`, error);
          return 0;
        }
      }
      // Get competition activities for a house
      async getHouseActivities(house, days = 30) {
        try {
          const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
          const chores2 = await storage.getChoresByHouse(house);
          const recentChores = chores2.filter(
            (chore) => chore.status === "completed" && new Date(chore.updatedAt || 0) >= startDate
          );
          const activities = recentChores.map((chore) => ({
            id: `chore-${chore.id}`,
            house,
            activity: `Completed: ${chore.title}`,
            points: this.pointSystem.choreCompletion.completed,
            category: "choreCompletion",
            date: new Date(chore.updatedAt || 0),
            description: chore.description || "",
            recordedBy: chore.assignedTo || "System"
          }));
          return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        } catch (error) {
          console.error(`Error getting activities for ${house}:`, error);
          return [];
        }
      }
      // Calculate comprehensive house scores
      async calculateHouseScores() {
        const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
        const scores = [];
        for (const house of houses) {
          try {
            const choreScore = await this.calculateChoreCompletionScore(house, "month");
            const weeklyChoreScore = await this.calculateChoreCompletionScore(house, "week");
            const punctualityScore = await this.calculatePunctualityScore(house, "month");
            const weeklyPunctualityScore = await this.calculatePunctualityScore(house, "week");
            const teamworkScore = Math.floor(Math.random() * 50) + 50;
            const cleanlinessScore = Math.floor(Math.random() * 40) + 60;
            const participationScore = Math.floor(Math.random() * 45) + 55;
            const categories = {
              choreCompletion: choreScore,
              punctuality: punctualityScore,
              teamwork: teamworkScore,
              cleanliness: cleanlinessScore,
              participation: participationScore
            };
            const totalPoints = Object.values(categories).reduce((sum, points) => sum + points, 0);
            const weeklyPoints = weeklyChoreScore + weeklyPunctualityScore;
            const achievements = [];
            if (categories.choreCompletion > 150) achievements.push("Chore Champions");
            if (categories.punctuality > 100) achievements.push("Always On Time");
            if (weeklyPoints > 200) achievements.push("Week Winners");
            if (totalPoints > 400) achievements.push("House Excellence");
            let badge = "";
            if (totalPoints > 450) badge = "\u{1F3C6} Gold House";
            else if (totalPoints > 350) badge = "\u{1F948} Silver House";
            else if (totalPoints > 250) badge = "\u{1F949} Bronze House";
            scores.push({
              house,
              totalPoints,
              monthlyPoints: totalPoints,
              weeklyPoints,
              categories,
              rank: 0,
              // Will be set after sorting
              badge,
              achievements
            });
          } catch (error) {
            console.error(`Error calculating scores for ${house}:`, error);
            scores.push({
              house,
              totalPoints: 0,
              monthlyPoints: 0,
              weeklyPoints: 0,
              categories: {
                choreCompletion: 0,
                punctuality: 0,
                teamwork: 0,
                cleanliness: 0,
                participation: 0
              },
              rank: 0,
              achievements: []
            });
          }
        }
        scores.sort((a, b) => b.totalPoints - a.totalPoints);
        scores.forEach((score, index2) => {
          score.rank = index2 + 1;
        });
        return scores;
      }
      // Get leaderboard with detailed breakdown
      async getLeaderboard() {
        const overallScores = await this.calculateHouseScores();
        const weeklyScores = overallScores.map((score) => ({
          ...score,
          totalPoints: score.weeklyPoints,
          monthlyPoints: score.weeklyPoints
        })).sort((a, b) => b.totalPoints - a.totalPoints);
        weeklyScores.forEach((score, index2) => {
          score.rank = index2 + 1;
        });
        const seasonStart = new Date(2024, 8, 1);
        const seasonEnd = new Date(2025, 6, 31);
        const now = /* @__PURE__ */ new Date();
        const totalDuration = seasonEnd.getTime() - seasonStart.getTime();
        const elapsed = Math.max(0, now.getTime() - seasonStart.getTime());
        const seasonProgress = Math.min(100, elapsed / totalDuration * 100);
        return {
          overall: overallScores,
          weekly: weeklyScores,
          lastUpdated: /* @__PURE__ */ new Date(),
          nextCompetition: "Monthly House Cup - December 2024",
          seasonProgress
        };
      }
      // Award points for specific activities
      async awardPoints(house, category, activity, points, description, recordedBy) {
        const activityRecord = {
          id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          house,
          activity,
          points,
          category,
          date: /* @__PURE__ */ new Date(),
          description,
          recordedBy
        };
        console.log("Points awarded:", activityRecord);
        return activityRecord;
      }
      // Get house competition statistics
      async getCompetitionStats() {
        try {
          const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];
          const allActivities = [];
          const competitionTrends = [];
          for (const house of houses) {
            const activities = await this.getHouseActivities(house, 30);
            allActivities.push(...activities);
            const lastWeek = activities.filter(
              (a) => a.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
            );
            const previousWeek = activities.filter(
              (a) => a.date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3) && a.date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
            );
            const lastWeekPoints = lastWeek.reduce((sum, a) => sum + a.points, 0);
            const previousWeekPoints = previousWeek.reduce((sum, a) => sum + a.points, 0);
            const trend = previousWeekPoints > 0 ? (lastWeekPoints - previousWeekPoints) / previousWeekPoints * 100 : 0;
            competitionTrends.push({ house, weeklyTrend: trend });
          }
          const totalPointsAwarded = allActivities.reduce((sum, a) => sum + a.points, 0);
          const averageWeeklyPoints = totalPointsAwarded / Math.max(houses.length * 4, 1);
          const houseActivityCounts = houses.map((house) => ({
            house,
            count: allActivities.filter((a) => a.house === house).length
          }));
          const mostActiveHouse = houseActivityCounts.reduce(
            (max, current) => current.count > max.count ? current : max
          ).house;
          return {
            totalActivities: allActivities.length,
            totalPointsAwarded,
            mostActiveHouse,
            averageWeeklyPoints,
            competitionTrends
          };
        } catch (error) {
          console.error("Error getting competition stats:", error);
          return {
            totalActivities: 0,
            totalPointsAwarded: 0,
            mostActiveHouse: "Widdersdorf 1",
            averageWeeklyPoints: 0,
            competitionTrends: []
          };
        }
      }
    };
    houseCompetition = new HouseCompetitionEngine();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";
import { z as z2 } from "zod";

// server/replitAuth.ts
init_storage();
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "connect.sid",
    cookie: {
      httpOnly: false,
      // Allow client-side access for debugging
      secure: false,
      // Set to false for development
      maxAge: sessionTtl,
      sameSite: "lax",
      path: "/"
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const email = claims["email"];
  const isAdmin2 = email?.endsWith("@fckoeln.de") || email?.endsWith("@warubi-sports.com");
  await storage.upsertUser({
    id: claims["sub"],
    username: email,
    // Use email as username for compatibility
    password: "oauth_placeholder",
    // OAuth users don't have passwords
    email,
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: isAdmin2 ? "admin" : "player",
    status: isAdmin2 ? "approved" : "pending"
    // Admins are auto-approved, players need approval
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err, user) => {
      if (err) {
        console.error("Auth error:", err);
        return res.redirect("/api/login");
      }
      if (!user) {
        console.error("No user returned from auth");
        return res.redirect("/api/login");
      }
      req.logIn(user, (err2) => {
        if (err2) {
          console.error("Login error:", err2);
          return res.redirect("/api/login");
        }
        if (req.session) {
          delete req.session.loggedOut;
          console.log("Cleared logout flag, redirecting to dashboard");
        }
        return res.redirect("/");
      });
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (req.session && req.session.loggedOut) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.session?.devLoggedIn && req.session?.userData) {
    console.log("Development login detected, allowing access");
    return next();
  }
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    const userId = user.claims.sub;
    const userData = await storage.getUser(userId);
    if (!userData || userData.status !== "approved") {
      return res.status(403).json({ message: "Account pending approval" });
    }
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    const userId = user.claims.sub;
    const userData = await storage.getUser(userId);
    if (!userData || userData.status !== "approved") {
      return res.status(403).json({ message: "Account pending approval" });
    }
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/auth-simple.ts
var loggedInUsers = /* @__PURE__ */ new Map();
var TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1e3;
var simpleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData) {
      req.user = userData;
      return next();
    }
  }
  res.status(401).json({ message: "Unauthorized" });
};
var simpleAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData && (userData.role === "admin" || userData.role === "coach")) {
      req.user = userData;
      return next();
    }
  }
  console.log("Admin auth failed:", {
    hasAuthHeader: !!authHeader,
    token: authHeader?.substring(7)?.substring(0, 10) + "...",
    userData: authHeader ? getUserFromToken(authHeader.substring(7)) : null,
    userRole: authHeader ? getUserFromToken(authHeader.substring(7))?.role : null,
    tokenCount: loggedInUsers.size
  });
  res.status(401).json({ message: "Admin or Coach access required" });
};
var simpleAdminOrCoachAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    if (userData && (userData.role === "admin" || userData.role === "coach")) {
      req.user = userData;
      return next();
    }
  }
  res.status(403).json({ message: "Admin or Coach access required" });
};
function createUserToken(userData) {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tokenData = {
    ...userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRATION
  };
  loggedInUsers.set(token, tokenData);
  console.log("Created token for user:", userData.id, "role:", userData.role, "expires:", new Date(tokenData.expiresAt));
  return token;
}
function getUserFromToken(token) {
  const tokenData = loggedInUsers.get(token);
  if (!tokenData) return null;
  if (Date.now() > tokenData.expiresAt) {
    loggedInUsers.delete(token);
    console.log("Token expired and removed:", token);
    return null;
  }
  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1e3;
  if (tokenData.expiresAt < oneDayFromNow) {
    tokenData.expiresAt = Date.now() + TOKEN_EXPIRATION;
    loggedInUsers.set(token, tokenData);
    console.log("Token auto-extended for user:", tokenData.id, "new expiry:", new Date(tokenData.expiresAt));
  }
  return tokenData;
}
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, userData] of loggedInUsers.entries()) {
    if (userData.expiresAt && now > userData.expiresAt) {
      loggedInUsers.delete(token);
      console.log("Cleaned up expired token:", token);
    }
  }
}
setInterval(cleanupExpiredTokens, 60 * 60 * 1e3);

// server/auth-bypass.ts
var devAuth = (req, res, next) => {
  next();
};

// server/email-service.ts
import { MailService } from "@sendgrid/mail";
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}
var mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);
async function sendEmail(params) {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
async function sendUserConfirmationEmail(userEmail, userName, house) {
  if (!userEmail) {
    console.error("No email provided for user confirmation");
    return false;
  }
  const subject = "Welcome to FC K\xF6ln International Talent Program!";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #333; color: white; padding: 15px; text-align: center; }
        .button { background-color: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .highlight { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>\u{1F3C6} FC K\xF6ln International Talent Program</h1>
      </div>
      
      <div class="content">
        <h2>Welcome ${userName}!</h2>
        
        <p>Congratulations! Your account has been approved by Max Bisinger and you're now officially part of the FC K\xF6ln International Talent Program.</p>
        
        <div class="highlight">
          <strong>Your Assignment:</strong><br>
          You have been assigned to <strong>${house}</strong>
        </div>
        
        <p>You can now access the full platform to:</p>
        <ul>
          <li>View your training schedule and upcoming matches</li>
          <li>Participate in team communications</li>
          <li>Manage your house responsibilities and chores</li>
          <li>Place weekly grocery orders</li>
          <li>Access your performance metrics and development plans</li>
        </ul>
        
        <p>
          <a href="https://warubisports.replit.app" class="button">Login to Platform</a>
        </p>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out to the coaching staff.</p>
        
        <p>Welcome to the team!</p>
        
        <p><strong>FC K\xF6ln Coaching Staff</strong></p>
      </div>
      
      <div class="footer">
        <p>FC K\xF6ln International Talent Program<br>
        This is an automated message from the team management system.</p>
      </div>
    </body>
    </html>
  `;
  const textContent = `
    Welcome to FC K\xF6ln International Talent Program!
    
    Congratulations ${userName}!
    
    Your account has been approved by Max Bisinger and you're now officially part of the FC K\xF6ln International Talent Program.
    
    Your Assignment: You have been assigned to ${house}
    
    You can now access the full platform to:
    - View your training schedule and upcoming matches
    - Participate in team communications
    - Manage your house responsibilities and chores
    - Place weekly grocery orders
    - Access your performance metrics and development plans
    
    Visit: https://warubisports.replit.app
    
    If you have any questions or need assistance, please don't hesitate to reach out to the coaching staff.
    
    Welcome to the team!
    
    FC K\xF6ln Coaching Staff
  `;
  return await sendEmail({
    to: userEmail,
    from: "max.bisinger@warubi-sports.com",
    // Admin email as sender
    subject,
    text: textContent,
    html: htmlContent
  });
}
async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  if (!userEmail) {
    console.error("No email provided for password reset");
    return false;
  }
  const subject = "Password Reset - FC K\xF6ln International Talent Program";
  const resetUrl = `https://warubisports.replit.app/reset-password?token=${resetToken}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #333; color: white; padding: 15px; text-align: center; }
        .button { background-color: #DC143C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .code { background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>\u{1F510} FC K\xF6ln International Talent Program</h1>
      </div>
      
      <div class="content">
        <h2>Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password for the FC K\xF6ln International Talent Program platform.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <p>
          <a href="${resetUrl}" class="button">Reset Password</a>
        </p>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Important:</strong>
          <ul>
            <li>This link will expire in 1 hour for security reasons</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Contact the coaching staff if you have any concerns</li>
          </ul>
        </div>
        
        <p>If you're having trouble clicking the button, copy and paste the link above into your web browser.</p>
        
        <p><strong>FC K\xF6ln Coaching Staff</strong></p>
      </div>
      
      <div class="footer">
        <p>FC K\xF6ln International Talent Program<br>
        This is an automated message from the team management system.</p>
      </div>
    </body>
    </html>
  `;
  const textContent = `
    Password Reset Request - FC K\xF6ln International Talent Program
    
    Hello ${userName},
    
    We received a request to reset your password for the FC K\xF6ln International Talent Program platform.
    
    Visit this link to reset your password:
    ${resetUrl}
    
    Important:
    - This link will expire in 1 hour for security reasons
    - If you didn't request this password reset, please ignore this email
    - Contact the coaching staff if you have any concerns
    
    FC K\xF6ln Coaching Staff
  `;
  return await sendEmail({
    to: userEmail,
    from: "max.bisinger@warubi-sports.com",
    subject,
    text: textContent,
    html: htmlContent
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  console.log("Database storage initialized successfully");
  console.log("Admin account available: max.bisinger@warubi-sports");
  app2.post("/api/auth/dev-login", async (req, res) => {
    req.session.devLoggedIn = true;
    req.session.userData = {
      id: "dev-admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@fckoeln.dev",
      role: "admin",
      status: "approved"
    };
    res.json({ message: "Development login successful", user: req.session.userData });
  });
  app2.post("/api/auth/dev-logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        res.status(500).json({ message: "Logout failed" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/auth/simple-logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        res.status(500).json({ message: "Logout failed" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/auth/simple-login", async (req, res) => {
    console.log("Raw request body:", req.body);
    console.log("Request headers:", req.headers);
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;
    console.log("Parsed credentials:", { loginIdentifier, password });
    console.log("Login identifier type:", typeof loginIdentifier);
    console.log("Password type:", typeof password);
    const validCredentials = [
      { username: "max.bisinger@warubi-sports.com", password: "ITP2024", role: "admin", name: "Max Bisinger" },
      { username: "max.bisinger@warubi-sports", password: "ITP2024", role: "admin", name: "Max Bisinger" },
      { username: "admin", password: "admin123", role: "admin", name: "Administrator" },
      { username: "coach", password: "coach123", role: "coach", name: "Coach" },
      { username: "staff", password: "staff123", role: "staff", name: "Staff Member" },
      { username: "manager", password: "manager123", role: "manager", name: "Team Manager" }
    ];
    console.log("Available credentials:", validCredentials.map((c) => ({ username: c.username, password: c.password })));
    let user = validCredentials.find((u) => u.username === loginIdentifier && u.password === password);
    if (!user) {
      try {
        const dbUser = await storage.getUserByUsername(loginIdentifier);
        console.log("Database user found:", dbUser);
        if (dbUser && dbUser.status === "approved" && dbUser.password === password) {
          const userEmail = dbUser.email || loginIdentifier;
          user = {
            username: userEmail,
            password: dbUser.password || "",
            role: dbUser.role || "player",
            name: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim()
          };
          console.log("Database user authenticated:", user);
        }
      } catch (error) {
        console.error("Error checking database user:", error);
      }
    }
    if (!user) {
      console.log("No matching user found for:", { loginIdentifier, password });
      console.log("Exact match check:", validCredentials.map((c) => ({
        username: c.username,
        usernameMatch: c.username === loginIdentifier,
        password: c.password,
        passwordMatch: c.password === password
      })));
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const userData = {
      id: user.username,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1] || "",
      email: user.username.includes("@") ? user.username : `${user.username}@fckoeln.dev`,
      role: user.role,
      status: "approved"
    };
    const token = createUserToken(userData);
    console.log("Login successful - token created:", token);
    res.json({
      message: "Login successful",
      user: userData,
      token
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request received:", req.body);
      const {
        password,
        firstName,
        lastName,
        email,
        dateOfBirth,
        nationality,
        nationalityCode,
        positions,
        role,
        house,
        phoneNumber,
        emergencyContact,
        emergencyPhone,
        profileImageUrl
      } = req.body;
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      try {
        const existingUser = await storage.getUserByUsername(email);
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
      } catch (error) {
        console.log("User does not exist, proceeding with registration");
      }
      const userData = {
        id: email,
        username: email,
        password,
        // In production, this should be hashed
        firstName,
        lastName,
        email,
        dateOfBirth: dateOfBirth || null,
        nationality: nationality || null,
        nationalityCode: nationalityCode || null,
        position: Array.isArray(positions) ? positions.join(", ") : positions || null,
        role,
        house: house || null,
        phoneNumber: phoneNumber || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        status: "pending",
        profileImageUrl: profileImageUrl || null
      };
      console.log("Creating user with data:", userData);
      const newUser = await storage.createUser(userData);
      console.log("User created successfully:", newUser);
      res.status(201).json({
        message: "Registration successful. Your account is pending approval.",
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }
      });
    } catch (error) {
      console.error("Registration error details:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });
  app2.post("/api/auth/clear-logout", async (req, res) => {
    delete req.session.loggedOut;
    res.json({ message: "Logout flag cleared" });
  });
  app2.get("/api/auth/debug", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (!token) {
      return res.json({
        status: "No token provided",
        hasAuthHeader: !!authHeader,
        authHeader
      });
    }
    const userData = getUserFromToken(token);
    res.json({
      status: userData ? "Valid token" : "Invalid or expired token",
      hasToken: !!token,
      token,
      userData: userData ? {
        id: userData.id,
        role: userData.role,
        email: userData.email,
        createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : null,
        expiresAt: userData.expiresAt ? new Date(userData.expiresAt).toISOString() : null
      } : null
    });
  });
  app2.get("/api/auth/user", async (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    console.log("Auth check - isAuthenticated:", req.isAuthenticated());
    console.log("Auth check - session exists:", !!req.session);
    console.log("Auth check - session ID:", req.sessionID);
    console.log("Auth check - session.simpleAuth:", req.session?.simpleAuth);
    console.log("Auth check - session.devLoggedIn:", req.session?.devLoggedIn);
    console.log("Auth check - session.userData:", !!req.session?.userData);
    console.log("Auth check - session.loggedOut:", req.session?.loggedOut);
    console.log("Auth check - full session:", req.session);
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const userData = getUserFromToken(token);
        if (userData) {
          console.log("Token auth successful for user:", userData.id);
          res.json(userData);
          return;
        }
      }
      if (req.session?.loggedOut) {
        console.log("User explicitly logged out, returning 401");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (req.session?.simpleAuth && req.session?.userData) {
        console.log("Returning simple auth user data:", req.session.userData);
        res.json(req.session.userData);
        return;
      }
      if (req.session?.devLoggedIn && req.session?.userData) {
        console.log("Returning session user data:", req.session.userData);
        res.json(req.session.userData);
        return;
      }
      if (req.user) {
        const userId2 = req.user.id;
        const user = await storage.getUser(userId2);
        if (user) {
          res.json(user);
        } else {
          res.json(req.user);
        }
        return;
      }
      const userId = req.user?.claims?.sub;
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          res.json(user);
        } else {
          res.status(401).json({ message: "User not found" });
        }
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    console.log("Login attempt with:", { email, firstName, lastName });
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const isAdmin2 = email.endsWith("@fckoeln.de") || email.endsWith("@warubi-sports.com");
    const role = isAdmin2 ? "admin" : "player";
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      username: email,
      // Use email as username for compatibility
      password: "oauth_placeholder",
      // OAuth users don't have passwords
      email,
      firstName,
      lastName,
      role,
      status: isAdmin2 ? "approved" : "pending",
      profileImageUrl: null
    };
    await storage.upsertUser(userData);
    const token = createUserToken(userData);
    console.log("Login successful for:", email, "Role:", role, "Token:", token);
    res.json({
      message: "Login successful",
      user: userData,
      token
    });
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });
  app2.put("/api/auth/profile", simpleAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      if (!profileData.firstName || !profileData.lastName || !profileData.email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json({
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });
  app2.post("/api/complete-profile", simpleAuth, async (req, res) => {
    try {
      const { dateOfBirth, nationality, position } = req.body;
      const userId = req.user.id;
      if (!dateOfBirth || !nationality || !position) {
        return res.status(400).json({ message: "All profile fields are required" });
      }
      await storage.updateUserProfile(userId, {
        dateOfBirth,
        nationality,
        position
      });
      res.json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });
  app2.get("/api/admin/pending-users", simpleAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Failed to fetch pending users" });
    }
  });
  app2.post("/api/admin/approve-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.approveUser(userId);
      if (user.email) {
        const userName = `${user.firstName} ${user.lastName}`;
        const house = user.house || "Widdersdorf 1";
        const emailSent = await sendUserConfirmationEmail(user.email, userName, house);
        if (emailSent) {
          console.log(`Confirmation email sent to ${user.email}`);
        } else {
          console.error(`Failed to send confirmation email to ${user.email}`);
        }
      }
      res.json({ message: "User approved successfully" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  app2.post("/api/admin/reject-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const resetToken = await storage.generatePasswordResetToken(email);
      if (!resetToken) {
        return res.json({ message: "If an account with that email exists, you will receive a password reset link." });
      }
      const user = await storage.getUserByUsername(email);
      if (user) {
        const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
        const emailSent = await sendPasswordResetEmail(user.email, userName, resetToken);
        if (emailSent) {
          console.log(`Password reset email sent to ${email}`);
        } else {
          console.error(`Failed to send password reset email to ${email}`);
        }
      }
      res.json({ message: "If an account with that email exists, you will receive a password reset link." });
    } catch (error) {
      console.error("Error processing forgot password:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const user = await storage.validatePasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      await storage.updatePassword(user.id, newPassword);
      console.log(`Password reset successful for user: ${user.email}`);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/admin/user-stats", simpleAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const players2 = await storage.getAllPlayers();
      const stats = {
        totalUsers: allUsers.length,
        pendingUsers: allUsers.filter((u) => u.status === "pending").length,
        approvedUsers: allUsers.filter((u) => u.status === "approved").length,
        activePlayers: players2.filter((p) => p.status === "active").length
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/admin/approved-users", simpleAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsersWithoutImages();
      const approvedUsers = allUsers.filter((u) => u.status === "approved").map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: null,
        // Explicitly set to null
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        nationalityCode: user.nationalityCode,
        position: user.position,
        role: user.role,
        status: user.status,
        house: user.house,
        phoneNumber: user.phoneNumber,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null
      }));
      console.log(`Returning ${approvedUsers.length} approved users`);
      res.json(approvedUsers);
    } catch (error) {
      console.error("Error fetching approved users:", error);
      res.status(500).json({ message: "Failed to fetch approved users" });
    }
  });
  app2.put("/api/admin/update-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      if (!updateData.firstName || !updateData.lastName || !updateData.email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      if (updatedUser.role === "player") {
        try {
          await storage.updatePlayerByEmail(updatedUser.email, {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            dateOfBirth: updateData.dateOfBirth,
            nationality: updateData.nationality,
            position: updateData.position,
            house: updateData.house
          });
        } catch (error) {
          console.log("No player record found or update failed:", error);
        }
      }
      res.json({
        message: "User updated successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/delete-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = req.user;
      const userEmail = adminUser?.userData?.email || adminUser?.email || adminUser?.id;
      if (userEmail !== "max.bisinger@warubi-sports.com@fckoeln.dev" && userEmail !== "max.bisinger@warubi-sports.com") {
        return res.status(403).json({ message: "Only Max Bisinger can delete users" });
      }
      if (userId === adminUser?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.delete("/api/admin/delete-player/:playerId", simpleAdminAuth, async (req, res) => {
    try {
      const { playerId } = req.params;
      const adminUser = req.user;
      const userEmail = adminUser?.userData?.email || adminUser?.email || adminUser?.id;
      if (userEmail !== "max.bisinger@warubi-sports.com@fckoeln.dev" && userEmail !== "max.bisinger@warubi-sports.com") {
        return res.status(403).json({ message: "Only Max Bisinger can delete players" });
      }
      const deleted = await storage.deletePlayer(parseInt(playerId));
      if (!deleted) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ message: "Failed to delete player" });
    }
  });
  app2.delete("/api/admin/reject-user/:userId", simpleAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.rejectUser(userId);
      res.json({ message: "User rejected successfully" });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });
  app2.post("/api/auth/complete-profile", isAuthenticated, async (req, res) => {
    try {
      const { dateOfBirth, nationality, position } = req.body;
      const userId = req.user.claims.sub;
      await storage.updateUserProfile(userId, {
        dateOfBirth,
        nationality,
        position
      });
      res.json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });
  app2.get("/api/players", async (req, res) => {
    try {
      const { search, position, ageGroup, nationality, status } = req.query;
      let players2;
      if (search) {
        players2 = await storage.searchPlayers(search);
      } else if (position || ageGroup || nationality || status) {
        players2 = await storage.filterPlayers({
          position,
          ageGroup,
          nationality,
          status
        });
      } else {
        players2 = await storage.getAllPlayers();
      }
      res.json(players2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });
  app2.get("/api/users", simpleAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const currentUserId = req.user?.id;
      const availableUsers = allUsers.filter((user) => user.status === "approved" && user.id !== currentUserId).map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        house: user.house,
        position: user.position,
        nationality: user.nationality
      }));
      res.json(availableUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });
  app2.post("/api/players/register", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth,
        nationality,
        nationalityCode,
        position,
        positions,
        preferredFoot,
        height,
        weight,
        jerseyNumber,
        previousClub,
        profileImageUrl,
        emergencyContactName,
        emergencyContactPhone,
        medicalConditions,
        allergies
      } = req.body;
      const birthDate = new Date(dateOfBirth);
      const today = /* @__PURE__ */ new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birthDate.getDate()) {
        age--;
      }
      const playerData = {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        age,
        nationality,
        nationalityCode,
        position,
        positions,
        preferredFoot: preferredFoot || "right",
        height: height ? parseInt(height) : void 0,
        weight: weight ? parseInt(weight) : void 0,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : void 0,
        previousClub,
        profileImageUrl,
        emergencyContactName,
        emergencyContactPhone,
        medicalConditions,
        allergies,
        status: "pending",
        // Default status for new registrations
        house: null,
        // Admin will assign house later
        availability: "available",
        availabilityReason: null
      };
      const validatedData = insertPlayerSchema.parse(playerData);
      const player = await storage.createPlayer(validatedData);
      res.status(201).json({
        message: "Registration submitted successfully. Your profile is pending approval.",
        player
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to register player" });
    }
  });
  app2.post("/api/players", simpleAdminOrCoachAuth, async (req, res) => {
    try {
      const validatedData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create player" });
    }
  });
  app2.put("/api/players/:id", simpleAdminOrCoachAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updatePlayerSchema.parse(req.body);
      const updatedPlayer = await storage.updatePlayer(id, validatedData);
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(updatedPlayer);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update player" });
    }
  });
  app2.delete("/api/players/:id", simpleAdminOrCoachAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlayer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });
  app2.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlayerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/players/export", async (req, res) => {
    try {
      const players2 = await storage.getAllPlayers();
      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Date of Birth",
        "Nationality",
        "Position",
        "Age Group",
        "Status",
        "Notes"
      ];
      const csvData = [
        headers.join(","),
        ...players2.map((player) => [
          player.id,
          `"${player.firstName}"`,
          `"${player.lastName}"`,
          `"${player.email}"`,
          `"${player.dateOfBirth}"`,
          `"${player.nationality}"`,
          `"${player.position}"`,
          `"${player.age || ""}"`,
          `"${player.status}"`,
          `"${player.notes || ""}"`
        ].join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=players.csv");
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export player data" });
    }
  });
  app2.get("/api/chores", simpleAuth, async (req, res) => {
    try {
      const user = req.user;
      const house = req.query.house;
      console.log("Chore request - user role:", user.role, "house filter:", house);
      if (user.role === "admin" || user.role === "coach") {
        let chores2;
        if (house) {
          console.log("Getting chores for house:", house);
          chores2 = await storage.getChoresByHouse(house);
        } else {
          console.log("Getting all chores");
          chores2 = await storage.getAllChores();
        }
        console.log("Found chores:", chores2.length);
        res.json(chores2);
      } else {
        const userName = user.username || user.id;
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        console.log("Player chore search - userName:", userName);
        console.log("Player chore search - fullName:", fullName);
        let chores2 = await storage.getChoresForUser(userName);
        if (chores2.length === 0 && fullName) {
          chores2 = await storage.getChoresForUserByName(fullName);
        }
        console.log("Player chores found:", chores2.length);
        console.log("Player chores:", chores2.map((c) => ({ id: c.id, title: c.title, assignedTo: c.assignedTo, house: c.house })));
        res.json(chores2);
      }
    } catch (error) {
      console.error("Error fetching chores:", error);
      res.status(500).json({ message: "Failed to fetch chores" });
    }
  });
  app2.get("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chore = await storage.getChore(id);
      if (!chore) {
        return res.status(404).json({ message: "Chore not found" });
      }
      res.json(chore);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chore" });
    }
  });
  app2.post("/api/chores", simpleAdminOrCoachAuth, async (req, res) => {
    try {
      const user = req.user;
      console.log("Creating chore - user:", user);
      console.log("Creating chore - request body:", req.body);
      const dataToValidate = {
        ...req.body,
        createdBy: user.id || user.username || user.email
      };
      console.log("Creating chore - data to validate:", dataToValidate);
      const validatedData = insertChoreSchema.parse(dataToValidate);
      const chore = await storage.createChore(validatedData);
      res.status(201).json(chore);
    } catch (error) {
      console.error("Error creating chore:", error);
      if (error instanceof z2.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create chore" });
    }
  });
  app2.put("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateChoreSchema.parse(req.body);
      const updatedChore = await storage.updateChore(id, validatedData);
      if (!updatedChore) {
        return res.status(404).json({ message: "Chore not found" });
      }
      res.json(updatedChore);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update chore" });
    }
  });
  app2.delete("/api/chores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChore(id);
      if (!deleted) {
        return res.status(404).json({ message: "Chore not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chore" });
    }
  });
  app2.get("/api/chore-stats", async (req, res) => {
    try {
      const stats = await storage.getChoreStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chore statistics" });
    }
  });
  app2.get("/api/chore-rotation/optimal-assignments/:house", async (req, res) => {
    try {
      const { house } = req.params;
      const { choreRotationEngine: choreRotationEngine2 } = await Promise.resolve().then(() => (init_choreRotation(), choreRotation_exports));
      const standardChores = [
        "Kitchen Cleaning",
        "Vacuum Common Areas",
        "Bathroom Cleaning",
        "Take Out Trash",
        "Laundry Room Maintenance"
      ];
      const result = await choreRotationEngine2.getOptimalChoreAssignments(house, standardChores);
      res.json(result);
    } catch (error) {
      console.error("Error getting optimal chore assignments:", error);
      res.status(500).json({ message: "Failed to get optimal assignments" });
    }
  });
  app2.get("/api/chore-rotation/fairness-report", async (req, res) => {
    try {
      const { choreRotationEngine: choreRotationEngine2 } = await Promise.resolve().then(() => (init_choreRotation(), choreRotation_exports));
      const report = await choreRotationEngine2.getFairnessReport();
      res.json(report);
    } catch (error) {
      console.error("Error getting fairness report:", error);
      res.status(500).json({ message: "Failed to get fairness report" });
    }
  });
  app2.post("/api/chore-rotation/generate-weekly", async (req, res) => {
    try {
      const { choreRotationEngine: choreRotationEngine2 } = await Promise.resolve().then(() => (init_choreRotation(), choreRotation_exports));
      const assignments = await choreRotationEngine2.generateWeeklyChoreAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error generating weekly assignments:", error);
      res.status(500).json({ message: "Failed to generate weekly assignments" });
    }
  });
  app2.get("/api/house-competition/leaderboard", async (req, res) => {
    try {
      const { houseCompetition: houseCompetition2 } = await Promise.resolve().then(() => (init_houseCompetition(), houseCompetition_exports));
      const leaderboard = await houseCompetition2.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting house leaderboard:", error);
      res.status(500).json({ message: "Failed to get house leaderboard" });
    }
  });
  app2.get("/api/house-competition/scores", async (req, res) => {
    try {
      const { houseCompetition: houseCompetition2 } = await Promise.resolve().then(() => (init_houseCompetition(), houseCompetition_exports));
      const scores = await houseCompetition2.calculateHouseScores();
      res.json(scores);
    } catch (error) {
      console.error("Error getting house scores:", error);
      res.status(500).json({ message: "Failed to get house scores" });
    }
  });
  app2.get("/api/house-competition/activities/:house", async (req, res) => {
    try {
      const { house } = req.params;
      const { days = "30" } = req.query;
      const { houseCompetition: houseCompetition2 } = await Promise.resolve().then(() => (init_houseCompetition(), houseCompetition_exports));
      const activities = await houseCompetition2.getHouseActivities(house, parseInt(days));
      res.json(activities);
    } catch (error) {
      console.error("Error getting house activities:", error);
      res.status(500).json({ message: "Failed to get house activities" });
    }
  });
  app2.get("/api/house-competition/stats", async (req, res) => {
    try {
      const { houseCompetition: houseCompetition2 } = await Promise.resolve().then(() => (init_houseCompetition(), houseCompetition_exports));
      const stats = await houseCompetition2.getCompetitionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting competition stats:", error);
      res.status(500).json({ message: "Failed to get competition stats" });
    }
  });
  app2.post("/api/house-competition/award-points", async (req, res) => {
    try {
      const { house, category, activity, points, description, recordedBy } = req.body;
      const { houseCompetition: houseCompetition2 } = await Promise.resolve().then(() => (init_houseCompetition(), houseCompetition_exports));
      const activityRecord = await houseCompetition2.awardPoints(
        house,
        category,
        activity,
        points,
        description,
        recordedBy
      );
      res.status(201).json(activityRecord);
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });
  let practiceExcuses2 = [
    {
      id: 1,
      playerName: "Max Mueller",
      date: "2024-06-03",
      reason: "Medical appointment - dentist visit scheduled weeks ago",
      status: "approved",
      submittedAt: "2024-06-01T10:00:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-01T14:00:00Z"
    },
    {
      id: 2,
      playerName: "Hans Weber",
      date: "2024-06-05",
      reason: "Family emergency - grandmother hospitalized",
      status: "approved",
      submittedAt: "2024-06-04T08:30:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-04T09:00:00Z"
    },
    {
      id: 3,
      playerName: "Erik Fischer",
      date: "2024-06-07",
      reason: "Want to sleep in",
      status: "denied",
      submittedAt: "2024-06-06T23:45:00Z",
      reviewedBy: "Coach Schmidt",
      reviewedAt: "2024-06-07T07:00:00Z",
      notes: "Insufficient reason. All players must attend regular training."
    },
    {
      id: 4,
      playerName: "Jan Richter",
      date: "2024-06-10",
      reason: "University exam that cannot be rescheduled",
      status: "pending",
      submittedAt: "2024-06-08T16:20:00Z"
    }
  ];
  let nextExcuseId = 5;
  function categorizeReason(reason) {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("medical") || lowerReason.includes("doctor") || lowerReason.includes("dentist") || lowerReason.includes("hospital")) {
      return "Medical";
    }
    if (lowerReason.includes("family") || lowerReason.includes("emergency")) {
      return "Family Emergency";
    }
    if (lowerReason.includes("exam") || lowerReason.includes("university") || lowerReason.includes("school")) {
      return "Academic";
    }
    if (lowerReason.includes("injury") || lowerReason.includes("hurt") || lowerReason.includes("pain")) {
      return "Injury";
    }
    return "Other";
  }
  app2.get("/api/practice-excuses", (req, res) => {
    res.json(practiceExcuses2.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ));
  });
  app2.post("/api/practice-excuses", (req, res) => {
    const { playerName, date, reason } = req.body;
    if (!playerName || !date || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (reason.length < 10) {
      return res.status(400).json({ error: "Reason must be at least 10 characters" });
    }
    const newExcuse = {
      id: nextExcuseId++,
      playerName,
      date,
      reason,
      status: "pending",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    practiceExcuses2.push(newExcuse);
    res.status(201).json(newExcuse);
  });
  app2.get("/api/practice-excuse-stats", (req, res) => {
    const stats = practiceExcuses2.reduce((acc, excuse) => {
      acc.totalExcuses++;
      if (excuse.status === "pending") acc.pendingExcuses++;
      if (excuse.status === "approved") acc.approvedExcuses++;
      if (excuse.status === "denied") acc.deniedExcuses++;
      const reasonCategory = categorizeReason(excuse.reason);
      acc.excusesByReason[reasonCategory] = (acc.excusesByReason[reasonCategory] || 0) + 1;
      return acc;
    }, {
      totalExcuses: 0,
      pendingExcuses: 0,
      approvedExcuses: 0,
      deniedExcuses: 0,
      excusesByReason: {}
    });
    res.json(stats);
  });
  app2.get("/api/food-orders", async (req, res) => {
    try {
      const orders = await storage.getAllFoodOrders();
      const activeOrders = orders.filter((order) => order.status !== "cancelled");
      res.json(activeOrders);
    } catch (error) {
      console.error("Error fetching food orders:", error);
      res.status(500).json({ message: "Failed to fetch food orders" });
    }
  });
  app2.post("/api/food-orders", async (req, res) => {
    try {
      const validatedData = insertFoodOrderSchema.parse(req.body);
      const estimatedCost = parseFloat(validatedData.estimatedCost || "0");
      if (estimatedCost > 35) {
        return res.status(400).json({
          message: "Order exceeds budget limit of \u20AC35.00",
          currentCost: estimatedCost
        });
      }
      const existingOrders = await storage.getFoodOrdersByPlayer(validatedData.playerName);
      const duplicateOrder = existingOrders.find(
        (order2) => order2.weekStartDate === validatedData.weekStartDate && order2.deliveryDay === validatedData.deliveryDay && order2.status !== "cancelled"
      );
      if (duplicateOrder) {
        return res.status(400).json({
          message: "Order already exists for this week and delivery day",
          existingOrderId: duplicateOrder.id
        });
      }
      const weekStart = new Date(validatedData.weekStartDate);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      if (weekStart < today) {
        return res.status(400).json({
          message: "Cannot place orders for past weeks"
        });
      }
      const order = await storage.createFoodOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating food order:", error);
        res.status(500).json({ message: "Failed to create food order" });
      }
    }
  });
  app2.get("/api/food-order-stats", async (req, res) => {
    try {
      const stats = await storage.getFoodOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching food order stats:", error);
      res.status(500).json({ message: "Failed to fetch food order stats" });
    }
  });
  app2.get("/api/house-order-summary", async (req, res) => {
    try {
      const { dateFilter } = req.query;
      const summary = await storage.getHouseOrderSummary(dateFilter);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching house order summary:", error);
      res.status(500).json({ message: "Failed to fetch house order summary" });
    }
  });
  app2.patch("/api/house-orders/confirm", simpleAuth, async (req, res) => {
    try {
      const userRole = req.user?.role;
      if (!userRole || !["admin", "staff"].includes(userRole)) {
        return res.status(403).json({ message: "Access denied. Admin or staff role required." });
      }
      const { houseName, weekStartDate } = req.body;
      if (!houseName || !weekStartDate) {
        return res.status(400).json({ message: "House name and week start date are required" });
      }
      const allOrders = await storage.getAllFoodOrders();
      const houseOrders = allOrders.filter(
        (order) => order.weekStartDate === weekStartDate && order.status === "pending"
      );
      const players2 = await storage.getAllPlayers();
      const housePlayerNames = players2.filter((player) => player.house === houseName).map((player) => `${player.firstName} ${player.lastName}`);
      const pendingHouseOrders = houseOrders.filter(
        (order) => housePlayerNames.includes(order.playerName)
      );
      if (pendingHouseOrders.length === 0) {
        return res.status(404).json({ message: "No pending orders found for this house and date" });
      }
      const confirmedOrders = [];
      for (const order of pendingHouseOrders) {
        const confirmedOrder = await storage.updateFoodOrder(order.id, {
          status: "confirmed",
          adminNotes: `Bulk confirmed for ${houseName} by ${req.user?.firstName || "admin"} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`
        });
        if (confirmedOrder) {
          confirmedOrders.push(confirmedOrder);
        }
      }
      res.json({
        message: `Confirmed ${confirmedOrders.length} orders for ${houseName}`,
        confirmedOrders,
        houseName,
        weekStartDate
      });
    } catch (error) {
      console.error("Error bulk confirming house orders:", error);
      res.status(500).json({ message: "Failed to bulk confirm house orders" });
    }
  });
  app2.patch("/api/house-orders/cancel", simpleAuth, async (req, res) => {
    try {
      const userRole = req.user?.role;
      if (!userRole || !["admin", "staff"].includes(userRole)) {
        return res.status(403).json({ message: "Access denied. Admin or staff role required." });
      }
      const { houseName, weekStartDate, reason } = req.body;
      if (!houseName || !weekStartDate) {
        return res.status(400).json({ message: "House name and week start date are required" });
      }
      const allOrders = await storage.getAllFoodOrders();
      const houseOrders = allOrders.filter(
        (order) => order.weekStartDate === weekStartDate && ["pending", "confirmed"].includes(order.status)
      );
      const players2 = await storage.getAllPlayers();
      const housePlayerNames = players2.filter((player) => player.house === houseName).map((player) => `${player.firstName} ${player.lastName}`);
      const cancellableHouseOrders = houseOrders.filter(
        (order) => housePlayerNames.includes(order.playerName)
      );
      if (cancellableHouseOrders.length === 0) {
        return res.status(404).json({ message: "No cancellable orders found for this house and date" });
      }
      const cancelledOrders = [];
      for (const order of cancellableHouseOrders) {
        const cancelledOrder = await storage.updateFoodOrder(order.id, {
          status: "cancelled",
          adminNotes: `Bulk cancelled for ${houseName} by ${req.user?.firstName || "admin"} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}${reason ? `. Reason: ${reason}` : ""}`
        });
        if (cancelledOrder) {
          cancelledOrders.push(cancelledOrder);
        }
      }
      res.json({
        message: `Cancelled ${cancelledOrders.length} orders for ${houseName}`,
        cancelledOrders,
        houseName,
        weekStartDate
      });
    } catch (error) {
      console.error("Error bulk cancelling house orders:", error);
      res.status(500).json({ message: "Failed to bulk cancel house orders" });
    }
  });
  app2.put("/api/food-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateFoodOrderSchema.parse(req.body);
      const order = await storage.updateFoodOrder(id, validatedData);
      if (!order) {
        res.status(404).json({ message: "Food order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating food order:", error);
        res.status(500).json({ message: "Failed to update food order" });
      }
    }
  });
  app2.patch("/api/food-orders/:id/complete", simpleAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      if (!userRole || !["admin", "staff"].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.status !== "confirmed") {
        return res.status(400).json({
          message: "Can only complete confirmed orders",
          currentStatus: order.status
        });
      }
      const {
        deliveredItems = {},
        actualCost,
        deliveryNotes,
        storageLocation,
        receivedBy,
        itemCondition = "good"
      } = req.body;
      const deliveredOrder = await storage.createDeliveredOrder({
        originalOrderId: order.id,
        playerName: order.playerName,
        weekStartDate: order.weekStartDate,
        deliveryDay: order.deliveryDay,
        // What was actually delivered
        deliveredProteins: deliveredItems.proteins || order.proteins,
        deliveredVegetables: deliveredItems.vegetables || order.vegetables,
        deliveredFruits: deliveredItems.fruits || order.fruits,
        deliveredGrains: deliveredItems.grains || order.grains,
        deliveredSnacks: deliveredItems.snacks || order.snacks,
        deliveredBeverages: deliveredItems.beverages || order.beverages,
        deliveredSupplements: deliveredItems.supplements || order.supplements,
        // Original order for comparison
        orderedProteins: order.proteins,
        orderedVegetables: order.vegetables,
        orderedFruits: order.fruits,
        orderedGrains: order.grains,
        orderedSnacks: order.snacks,
        orderedBeverages: order.beverages,
        orderedSupplements: order.supplements,
        actualCost: actualCost || order.estimatedCost,
        estimatedCost: order.estimatedCost,
        deliveryNotes: deliveryNotes || `Delivered by ${req.user?.firstName || "staff"}`,
        storageLocation,
        deliveredBy: `${req.user?.firstName || ""} ${req.user?.lastName || ""}`.trim() || "Staff",
        receivedBy,
        itemCondition
      });
      const updatedOrder = await storage.updateFoodOrder(id, {
        status: "delivered",
        adminNotes: `Marked as delivered by ${req.user?.firstName || "admin"} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}. Stored in delivery record #${deliveredOrder.id}`
      });
      res.json({
        order: updatedOrder,
        deliveredOrder
      });
    } catch (error) {
      console.error("Error completing order:", error);
      res.status(500).json({ message: "Failed to complete order" });
    }
  });
  app2.patch("/api/food-orders/:id/confirm", simpleAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      if (!userRole || !["admin", "staff"].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.status !== "pending") {
        return res.status(400).json({
          message: `Cannot confirm order with status '${order.status}'. Only pending orders can be confirmed.`,
          currentStatus: order.status
        });
      }
      const updatedOrder = await storage.updateFoodOrder(id, {
        status: "confirmed",
        adminNotes: `Confirmed by ${req.user?.firstName || "admin"} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`
      });
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Failed to confirm order" });
    }
  });
  app2.patch("/api/food-orders/:id/cancel", simpleAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user?.role;
      if (!userRole || !["admin", "staff"].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const order = await storage.getFoodOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.status === "delivered") {
        return res.status(400).json({
          message: "Cannot cancel delivered orders"
        });
      }
      const { reason } = req.body;
      const updatedOrder = await storage.updateFoodOrder(id, {
        status: "cancelled",
        adminNotes: `Cancelled by ${req.user?.firstName || "admin"} on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}${reason ? `. Reason: ${reason}` : ""}`
      });
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });
  app2.get("/api/messages", async (req, res) => {
    try {
      const messages2 = await storage.getAllMessages();
      console.log("Fetched", messages2.length, "messages");
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", async (req, res) => {
    try {
      console.log("Creating message with data:", JSON.stringify(req.body, null, 2));
      const messageData = req.body;
      const message = await storage.createMessage(messageData);
      console.log("Created message:", JSON.stringify(message, null, 2));
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  app2.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.delete("/api/messages/:id", simpleAuth, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const currentUser = req.user;
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const canDelete = message.from_user_id === currentUser?.id || currentUser?.role === "admin";
      if (!canDelete) {
        return res.status(403).json({ message: "Not authorized to delete this message" });
      }
      const deleted = await storage.deleteMessage(messageId);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
  app2.delete("/api/messages/team/all", simpleAdminAuth, async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllTeamMessages();
      res.json({ message: `Deleted ${deletedCount} team messages successfully` });
    } catch (error) {
      console.error("Error deleting all team messages:", error);
      res.status(500).json({ message: "Failed to delete team messages" });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      console.log("Events API called by user:", req.user?.id || "unauthenticated");
      const events2 = await storage.getAllEvents();
      console.log("Found", events2.length, "events");
      res.json(events2);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/event-templates", async (req, res) => {
    try {
      const templates = await storage.getAllEventTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching event templates:", error);
      res.status(500).json({ message: "Failed to fetch event templates" });
    }
  });
  app2.post("/api/event-templates", simpleAdminOrCoachAuth, async (req, res) => {
    try {
      const templateData = {
        ...req.body,
        createdBy: req.user.userData?.id || req.user.id
      };
      const template = await storage.createEventTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating event template:", error);
      res.status(500).json({ message: "Failed to create event template" });
    }
  });
  app2.delete("/api/event-templates/:id", simpleAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEventTemplate(id);
      res.json({ message: "Event template deleted successfully" });
    } catch (error) {
      console.error("Error deleting event template:", error);
      res.status(500).json({ message: "Failed to delete event template" });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.user?.id || "dev-admin";
      const notifications2 = await storage.getNotificationsByUser(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/cleanup", simpleAuth, async (req, res) => {
    try {
      const userRole = req.user?.role;
      if (!userRole || userRole !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }
      const readCleanup = await storage.cleanupOldNotifications();
      const unreadCleanup = await storage.cleanupOldUnreadNotifications();
      res.json({
        message: "Notification cleanup completed",
        readNotificationsDeleted: readCleanup.deletedCount,
        staleUnreadNotificationsDeleted: unreadCleanup.deletedCount,
        totalDeleted: readCleanup.deletedCount + unreadCleanup.deletedCount
      });
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      res.status(500).json({ message: "Failed to cleanup notifications" });
    }
  });
  app2.patch("/api/events/bulk", simpleAdminAuth, async (req, res) => {
    try {
      const { eventIds, updates } = req.body;
      const events2 = await storage.bulkUpdateEvents(eventIds, updates);
      res.json(events2);
    } catch (error) {
      console.error("Error bulk updating events:", error);
      res.status(500).json({ message: "Failed to bulk update events" });
    }
  });
  app2.delete("/api/events/bulk", simpleAdminAuth, async (req, res) => {
    try {
      const { eventIds } = req.body;
      await storage.bulkDeleteEvents(eventIds);
      res.json({ message: "Events deleted successfully" });
    } catch (error) {
      console.error("Error bulk deleting events:", error);
      res.status(500).json({ message: "Failed to bulk delete events" });
    }
  });
  app2.get("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  const normalizeEventType = (eventType) => {
    const eventTypeMap = {
      "Weight Lifting": "weight_lifting",
      "Weight Lifting Session": "weight_lifting",
      "Team Practice Session": "team_practice",
      "Group Practice Session": "group_practice",
      "Cryotherapy Session": "cryotherapy",
      "Language School": "language_school",
      "Doctor's Appointment": "medical_checkup",
      "Trial Session": "trial_session",
      "Match": "match",
      "Team Meeting": "team_meeting",
      "Fitness Assessment": "fitness_session",
      "Recovery Session": "recovery_session",
      "Other": "other"
    };
    return eventTypeMap[eventType] || eventType.toLowerCase().replace(/\s+/g, "_");
  };
  const getEventTitleFromType = (eventType) => {
    const titleMap = {
      "weight_lifting": "Weight Lifting",
      "team_practice": "Team Practice",
      "group_practice": "Group Practice",
      "cryotherapy": "Cryotherapy Session",
      "language_school": "Language School",
      "medical_checkup": "Medical Checkup",
      "trial_session": "Trial Session",
      "match": "Match",
      "team_meeting": "Team Meeting",
      "fitness_session": "Fitness Session",
      "recovery_session": "Recovery Session",
      "individual_training": "Individual Training",
      "tactical_training": "Tactical Training",
      "video_session": "Video Session",
      "travel": "Travel",
      "nutrition_consultation": "Nutrition Consultation",
      "mental_coaching": "Mental Coaching",
      "physiotherapy": "Physiotherapy",
      "other": "Other"
    };
    return titleMap[eventType] || eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  app2.post("/api/events/fix-titles", simpleAdminAuth, async (req, res) => {
    try {
      const events2 = await storage.getAllEvents();
      let fixedCount = 0;
      for (const event of events2) {
        if (event.title === event.eventType) {
          const properTitle = getEventTitleFromType(event.eventType);
          await storage.updateEvent(event.id, { title: properTitle });
          fixedCount++;
        }
      }
      res.json({
        message: `Fixed ${fixedCount} event titles`,
        fixedCount
      });
    } catch (error) {
      console.error("Error fixing event titles:", error);
      res.status(500).json({ message: "Failed to fix event titles" });
    }
  });
  app2.post("/api/events", devAuth, async (req, res) => {
    try {
      console.log("Original request body:", req.body);
      console.log("isRecurring check:", req.body.isRecurring, "type:", typeof req.body.isRecurring);
      console.log("recurringPattern check:", req.body.recurringPattern, "type:", typeof req.body.recurringPattern);
      const rawEventType = req.body.type || req.body.eventType;
      const normalizedEventType = normalizeEventType(rawEventType);
      const baseEventData = {
        title: req.body.title,
        eventType: normalizedEventType,
        date: req.body.date,
        startTime: req.body.time || req.body.startTime,
        endTime: req.body.endTime || req.body.time,
        location: req.body.location,
        notes: req.body.description || req.body.notes,
        participants: req.body.participants,
        createdBy: "Admin User"
      };
      console.log("Mapped event data:", baseEventData);
      if (req.body.isRecurring && req.body.recurringPattern) {
        console.log("Processing recurring event:", {
          pattern: req.body.recurringPattern,
          days: req.body.recurringDays,
          startDate: req.body.date,
          endDate: req.body.recurringEndDate
        });
        const events2 = [];
        const startDate = new Date(req.body.date);
        const endDate = req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const shouldCreateEvent = (() => {
            switch (req.body.recurringPattern) {
              case "daily":
                return true;
              case "weekdays":
                const dayOfWeek = currentDate.getDay();
                return dayOfWeek >= 1 && dayOfWeek <= 5;
              // Monday to Friday
              case "weekly":
                return currentDate.getDay() === startDate.getDay();
              case "monthly":
                return currentDate.getDate() === startDate.getDate();
              case "custom":
                if (!req.body.recurringDays) return false;
                const selectedDays = req.body.recurringDays.split(",").map((day) => day.trim().toLowerCase());
                const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                const currentDayName = dayNames[currentDate.getDay()];
                return selectedDays.includes(currentDayName);
              default:
                return false;
            }
          })();
          if (shouldCreateEvent) {
            const eventData = {
              ...baseEventData,
              date: currentDate.toISOString().split("T")[0],
              isRecurring: true,
              recurringPattern: req.body.recurringPattern
            };
            const event = await storage.createEvent(eventData);
            events2.push(event);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        console.log(`Created ${events2.length} recurring events`);
        res.status(201).json({ message: `Created ${events2.length} recurring events`, events: events2 });
      } else {
        const event = await storage.createEvent(baseEventData);
        res.status(201).json(event);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  app2.put("/api/events/:id", simpleAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateEvent(id, req.body);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  app2.patch("/api/events/:id", simpleAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateEvent(id, req.body);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  app2.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  app2.get("/api/events/date/:date", isAuthenticated, async (req, res) => {
    try {
      const date = req.params.date;
      const events2 = await storage.getEventsByDate(date);
      res.json(events2);
    } catch (error) {
      console.error("Error fetching events by date:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  app2.get("/api/recent-activities", simpleAuth, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.set("trust proxy", 1);
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
