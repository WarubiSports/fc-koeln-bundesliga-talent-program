// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// If you ever hit issues with "postgresql://" vs "postgres://", you can
// normalize here, but pg usually accepts both.
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, {
  schema,
});