import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table for authentication and user management
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').notNull().default('player'), // player, staff, admin
  phone: text('phone'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Join requests table for member management
export const joinRequests = pgTable('join_requests', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  nationality: text('nationality').notNull(),
  currentClub: text('current_club'),
  position: text('position'),
  strongFoot: text('strong_foot'),
  height: text('height'),
  weight: text('weight'),
  parentGuardianName: text('parent_guardian_name'),
  parentGuardianPhone: text('parent_guardian_phone'),
  parentGuardianEmail: text('parent_guardian_email'),
  motivation: text('motivation').notNull(),
  requestType: text('request_type').notNull(), // 'player' or 'staff'
  staffPosition: text('staff_position'), // for staff requests
  staffExperience: text('staff_experience'), // for staff requests
  status: text('status').notNull().default('pending'), // pending, approved, rejected
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJoinRequestSchema = createInsertSchema(joinRequests).omit({
  id: true,
  status: true,
  adminNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type JoinRequest = typeof joinRequests.$inferSelect;
export type InsertJoinRequest = z.infer<typeof insertJoinRequestSchema>;