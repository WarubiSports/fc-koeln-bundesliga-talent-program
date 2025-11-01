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
  
  // Check if origin is from trusted platforms (secure hostname matching)
  let isTrustedPlatform = false;
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      isTrustedPlatform = hostname.endsWith('.replit.dev') || 
                         hostname.endsWith('.repl.co') ||
                         hostname.endsWith('.replit.app') ||
                         hostname.endsWith('.railway.app');
    } catch {
      // Invalid URL, not a trusted platform
    }
  }
  
  const allowed = !origin || origins.includes(origin) || isTrustedPlatform;
  if (!allowed) {
    console.log('❌ CORS rejected:', { origin, origins, isTrustedPlatform });
    return res.status(403).json({ error: 'Origin not allowed for this app' });
  }

  return cors({ origin: origin ?? true, credentials: true })(req, res, next);
}
