import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function signUserJwt(userId: string, roles: string[], appId?: string) {
  const payload: any = { sub: userId, roles };
  if (appId) payload.aud = appId; // optional now; required later
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}
export function verifyUserJwt(token: string, expectedAppId?: string) {
  // in single-app mode, we don't require aud; in strict, we do
  const STRICT = (process.env.MULTIAPP_STRICT ?? "false") === "true";
  return jwt.verify(token, JWT_SECRET, STRICT && expectedAppId ? { audience: expectedAppId } : {});
}
