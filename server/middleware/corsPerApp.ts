import cors from 'cors';
import type { Request } from 'express';

// CORS per app (using the stubbed appCtx above)
export function corsPerApp(req: Request, res: any, next: any) {
  const origin = req.headers.origin as string | undefined;
  const origins = req.appCtx?.origins ?? [];
  const allowed = !origin || origins.includes(origin);
  if (!allowed) return res.status(403).json({ error: 'Origin not allowed for this app' });

  return cors({ origin: origin ?? true, credentials: true })(req, res, next);
}
