import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      appCtx?: { id: string; name: string; origins: string[]; rps: number };
    }
  }
}

// Single-app stub: sets a fixed "core" app context.
// Replace later with the DB-backed version.
export async function attachAppContext(_req: Request, _res: Response, next: NextFunction) {
  const origins = ['http://localhost:5173'];
  // You can add your deployed domain here later as well.
  ( _req as any ).appCtx = { id: 'core', name: 'Core App', origins, rps: 600 };
  next();
}
