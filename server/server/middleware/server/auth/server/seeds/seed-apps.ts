import crypto from "node:crypto";
import { db } from "../db";
import { apps } from "../app-registry.schema";
import { eq } from "drizzle-orm";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// Single app to start
const seed = {
  id: "core",
  name: "Core App",
  apiKey: process.env.APPKEY_CORE_SEED ?? "CORE_DEV_KEY_123",
  origins: ["http://localhost:5173"], // add your deployed domain later
  rps: 600
};

const [existing] = await db.select().from(apps).where(eq(apps.id, seed.id));
if (existing) {
  await db.update(apps).set({
    allowedOrigins: JSON.stringify(seed.origins),
    rateLimitPerMin: seed.rps,
    active: true
  }).where(eq(apps.id, seed.id));
  console.log("Updated core app");
} else {
  await db.insert(apps).values({
    id: seed.id,
    name: seed.name,
    apiKeyHash: sha256(seed.apiKey),
    allowedOrigins: JSON.stringify(seed.origins),
    rateLimitPerMin: seed.rps,
    active: true
  });
  console.log("Inserted core app");
}
console.log(`core apiKey (dev): ${seed.apiKey}`);
