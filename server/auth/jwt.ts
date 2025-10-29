import jwt from "jsonwebtoken";

// Require JWT secret - fail fast if not configured
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set for secure authentication');
}

export type JwtPayload = { sub: string; email: string; app?: string };

export function signToken(payload: JwtPayload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Optional stricter verification used by multi-app routes.
 * Throws on invalid token or audience mismatch.
 */
export function verifyUserJwt(token: string, expectedAppId?: string): JwtPayload {
  const payload = verifyToken(token);
  if (!payload) throw new Error("invalid_token");
  if (expectedAppId && payload.app && payload.app !== expectedAppId) {
    throw new Error("audience_mismatch");
  }
  return payload;
}
