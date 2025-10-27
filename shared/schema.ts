// shared/schema.ts
import { pgTable, varchar, boolean, integer, timestamp, text } from "drizzle-orm/pg-core";

export const apps = pgTable("apps", {
  id: varchar({ length: 40 }).primaryKey(),            // e.g. "core", "athletesusa"
  name: varchar({ length: 100 }).notNull(),
  apiKeyHash: varchar("api_key_hash", { length: 128 }).notNull(),
  allowedOrigins: text("allowed_origins").notNull(),    // JSON string[]
  rateLimitPerMin: integer("rate_limit_per_min").notNull().default(600),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});