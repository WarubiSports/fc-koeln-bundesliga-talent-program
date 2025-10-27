// server/setup/setup-apps.ts
// Create "apps" table and seed the 'core' app using two separate queries.

import { Client } from "pg";
import crypto from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL (set it in Replit Secrets).");
  process.exit(1);
}

const CORE_APP_KEY = process.env.APPKEY_CORE_SEED || "CORE_DEV_KEY_123";
const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

// IMPORTANT: exactly ONE statement per string here.
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS apps (
  id varchar(40) PRIMARY KEY,
  name varchar(100) NOT NULL,
  api_key_hash varchar(128) NOT NULL,
  allowed_origins text NOT NULL,
  rate_limit_per_min integer NOT NULL DEFAULT 600,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
)
`;

const UPSERT_SQL = `
INSERT INTO apps (id, name, api_key_hash, allowed_origins, rate_limit_per_min, active)
VALUES ($1, $2, $3, $4, $5, true)
ON CONFLICT (id) DO UPDATE SET
  allowed_origins = EXCLUDED.allowed_origins,
  rate_limit_per_min = EXCLUDED.rate_limit_per_min,
  active = EXCLUDED.active
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const allowedOrigins = JSON.stringify(["http://localhost:5173"]);

  console.log("→ BEGIN");
  await client.query("BEGIN");

  console.log("→ CREATE TABLE apps IF NOT EXISTS");
  await client.query(CREATE_TABLE_SQL); // single statement, no params

  console.log("→ UPSERT core app");
  await client.query(UPSERT_SQL, [
    "core",
    "Core App",
    sha256(CORE_APP_KEY),
    allowedOrigins,
    600,
  ]);

  console.log("→ COMMIT");
  await client.query("COMMIT");
  await client.end();

  console.log("✅ apps table ready and 'core' app seeded");
  console.log(`core app key (dev): ${CORE_APP_KEY}`);
}

main().catch(async (e) => {
  console.error("❌ Setup failed:", e);
  process.exit(1);
});
