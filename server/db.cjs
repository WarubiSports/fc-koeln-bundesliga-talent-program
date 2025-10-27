// CommonJS database connection for fc-koln-stable-permanent.cjs
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Note: schema needs to be imported differently for CommonJS
// For now, we'll use the drizzle client without schema typing
const db = drizzle({ client: pool });

module.exports = { db, pool };
