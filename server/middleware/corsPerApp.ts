import cors from 'cors';
import type { Request } from 'express';

// CORS per app (using the stubbed appCtx above)
export function corsPerApp(req: Request, res: any, next: any) {
  const origin = req.headers.origin as string | undefined;
  const origins = req.appCtx?.origins ?? [];
  
  // In development, allow all origins for easier testing
  if (process.env.NODE_ENV !== 'production') {
    return cors({ origin: true, credentials: true })(req, res, next);
  }
  
  // Check if origin is from Replit platform (secure hostname matching)
  let isReplitOrigin = false;
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      isReplitOrigin = hostname.endsWith('.replit.dev') || 
                      hostname.endsWith('.repl.co') ||
                      hostname.endsWith('.replit.app');
    } catch {
      // Invalid URL, not a Replit origin
    }
  }
  
  const allowed = !origin || origins.includes(origin) || isReplitOrigin;
  if (!allowed) {
    console.log('❌ CORS rejected:', { origin, origins, isReplitOrigin });
    return res.status(403).json({ error: 'Origin not allowed for this app' });
  }

  return cors({ origin: origin ?? true, credentials: true })(req, res, next);
}
