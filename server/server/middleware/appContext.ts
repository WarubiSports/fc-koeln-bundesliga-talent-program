import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { Client } from "pg";

declare global {
  namespace Express {
    interface Request {
      appCtx?: { id: string; name: string; origins: string[]; rps: number };
    }
  }
}

const STRICT = (process.env.MULTIAPP_STRICT ?? "false") === "true";
const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

async function fetchOne<T>(sql: string, params: any[]): Promise<T | undefined> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(sql, params);
  await client.end();
  return rows[0] as T | undefined;
}

export async function attachAppContext(req: Request, res: Response, next: NextFunction) {
  try {
    const headerKey = req.header("x-api-key");

    // Single-app mode: no key required, use 'core'
    if (!STRICT && !headerKey) {
      const app = await fetchOne<any>(
        `SELECT id, name, allowed_origins, rate_limit_per_min, active FROM apps WHERE id=$1`,
        ["core"],
      );
      if (!app || !app.active) return res.status(500).json({ error: "Core app not seeded or inactive" });
      req.appCtx = {
        id: app.id,
        name: app.name,
        origins: JSON.parse(app.allowed_origins || "[]"),
        rps: app.rate_limit_per_min ?? 600,
      };
      return next();
    }

    // Strict mode (or key provided): look up by key
    if (!headerKey) return res.status(401).json({ error: "Missing x-api-key" });

    const app = await fetchOne<any>(
      `SELECT id, name, allowed_origins, rate_limit_per_min, active FROM apps WHERE api_key_hash=$1`,
      [sha256(headerKey)],
    );
    if (!app || !app.active) return res.status(403).json({ error: "Invalid app key" });

    req.appCtx = {
      id: app.id,
      name: app.name,
      origins: JSON.parse(app.allowed_origins || "[]"),
      rps: app.rate_limit_per_min ?? 600,
    };
    next();
  } catch (e) {
    console.error("[appContext]", e);
    res.status(500).json({ error: "App context error" });
  }
}

