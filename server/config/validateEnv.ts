import "dotenv/config";

// Critical secrets that must always be present
const alwaysRequired = ["DATABASE_URL", "JWT_SECRET"];

// Secrets required only in production
const requiredInProd = ["SESSION_SECRET", "ADMIN_API_KEY"];

// Optional but recommended
const recommended = ["AI_INTEGRATIONS_GEMINI_API_KEY", "SENDGRID_API_KEY"];

function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check always-required secrets
  for (const key of alwaysRequired) {
    if (!process.env[key]) {
      errors.push(`${key} is required for server operation`);
    }
  }

  // Check production-only secrets
  if (isProd) {
    for (const key of requiredInProd) {
      if (!process.env[key]) {
        errors.push(`${key} is required in production`);
      }
    }
  }

  // Check recommended secrets (warn only)
  for (const key of recommended) {
    if (!process.env[key]) {
      warnings.push(`${key} not set - some features may be unavailable`);
    }
  }

  // Print warnings
  for (const warning of warnings) {
    console.warn(`⚠️  ${warning}`);
  }

  // Exit on critical errors
  if (errors.length > 0) {
    console.error("\n❌ FATAL: Missing required environment variables:\n");
    for (const error of errors) {
      console.error(`   • ${error}`);
    }
    console.error("\nServer cannot start without these variables.\n");
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}

validateEnvironment();
