import "dotenv/config";

const requiredInProd = ["DATABASE_URL", "SESSION_SECRET", "JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  const missing = requiredInProd.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("❌ Missing environment variables (production):", missing.join(", "));
    process.exit(1);
  }
}
