import "dotenv/config";

const required = ["DATABASE_URL", "SESSION_SECRET", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  // Don’t print actual secret values, only keys
  console.error("❌ Missing environment variables:", missing.join(", "));
  process.exit(1);
}
