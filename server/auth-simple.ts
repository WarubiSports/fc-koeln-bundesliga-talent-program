import type { RequestHandler } from "express";

// Simple in-memory store for logged-in users (development only)
const loggedInUsers = new Map<string, any>();

export const simpleAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = loggedInUsers.get(token);
    
    if (userData) {
      req.user = { userData };
      return next();
    }
  }
  
  res.status(401).json({ message: "Unauthorized" });
};

export const simpleAdminAuth: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const userData = loggedInUsers.get(token);
    
    if (userData && userData.role === 'admin') {
      req.user = { userData };
      return next();
    }
  }
  
  res.status(403).json({ message: "Admin access required" });
};

export function createUserToken(userData: any): string {
  const token = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  loggedInUsers.set(token, userData);
  return token;
}

export function removeUserToken(token: string): void {
  loggedInUsers.delete(token);
}