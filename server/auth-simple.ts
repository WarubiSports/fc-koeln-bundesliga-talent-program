import type { RequestHandler } from "express";

// Simple in-memory store for logged-in users (development only)
const loggedInUsers = new Map<string, any>();

// Token expiration time (24 hours)
const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;

export const simpleAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    
    if (userData) {
      req.user = userData;
      return next();
    }
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

export const simpleAdminAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    
    if (userData && userData.role === 'admin') {
      req.user = userData;
      return next();
    }
  }
  
  // Log authentication failure for debugging
  console.log('Admin auth failed:', {
    hasAuthHeader: !!authHeader,
    token: authHeader?.substring(7),
    userData: authHeader ? getUserFromToken(authHeader.substring(7)) : null,
    allTokens: Array.from(loggedInUsers.keys()),
    tokenCount: loggedInUsers.size
  });
  
  res.status(401).json({ message: "Admin access required" });
};

// Admin or Coach authentication for calendar and player management
export const simpleAdminOrCoachAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = getUserFromToken(token);
    
    if (userData && (userData.role === 'admin' || userData.role === 'coach')) {
      req.user = userData;
      return next();
    }
  }
  
  res.status(403).json({ message: "Admin or Coach access required" });
};

export function createUserToken(userData: any): string {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tokenData = {
    ...userData,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRATION
  };
  loggedInUsers.set(token, tokenData);
  console.log('Created token for user:', userData.id, 'role:', userData.role, 'expires:', new Date(tokenData.expiresAt));
  return token;
}

export function getUserFromToken(token: string): any | null {
  const tokenData = loggedInUsers.get(token);
  if (!tokenData) return null;
  
  // Check if token is expired
  if (Date.now() > tokenData.expiresAt) {
    loggedInUsers.delete(token);
    console.log('Token expired and removed:', token);
    return null;
  }
  
  // Auto-extend token if it's still valid and close to expiration (within 2 hours)
  const twoHoursFromNow = Date.now() + (2 * 60 * 60 * 1000);
  if (tokenData.expiresAt < twoHoursFromNow) {
    tokenData.expiresAt = Date.now() + TOKEN_EXPIRATION;
    loggedInUsers.set(token, tokenData);
    console.log('Token auto-extended for user:', tokenData.id, 'new expiry:', new Date(tokenData.expiresAt));
  }
  
  return tokenData;
}

export function removeUserToken(token: string): void {
  loggedInUsers.delete(token);
}

// Clean up expired tokens periodically
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [token, userData] of loggedInUsers.entries()) {
    if (userData.expiresAt && now > userData.expiresAt) {
      loggedInUsers.delete(token);
      console.log('Cleaned up expired token:', token);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);