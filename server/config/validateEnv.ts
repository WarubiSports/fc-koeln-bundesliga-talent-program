import "dotenv/config";

// Critical secrets that must always be present
const alwaysRequired = ["DATABASE_URL"];

// Secrets required only in production (warnings in development)
const requiredInProd = ["JWT_SECRET", "SESSION_SECRET", "ADMIN_API_KEY"];

// Optional but recommended (always warnings only)
const recommended = ["AI_INTEGRATIONS_GEMINI_API_KEY", "SENDGRID_API_KEY"];

function validateEnvironment(): void {
  const isProd = process.env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check always-required secrets (DATABASE_URL is truly critical)
  for (const key of alwaysRequired) {
    if (!process.env[key]) {
      errors.push(`${key} is required for server operation`);
    }
  }

  // Check production-required secrets
  for (const key of requiredInProd) {
    if (!process.env[key]) {
      if (isProd) {
        // In production, these are errors
        errors.push(`${key} is required in production`);
      } else {
        // In development, just warn
        warnings.push(`${key} not set - using defaults for development`);
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

  // Exit on critical errors only
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
