import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pool } = require('../../db.cjs');

const JWT_SECRET = process.env.JWT_SECRET || '';

export interface JWTPayload {
  sub: string;
  email: string;
  app: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: JWTPayload;
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void | Response {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.userId = decoded.sub;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
}

export function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction): void | Response {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return res.status(403).json({ 
      success: false, 
      message: 'Staff or admin access required' 
    });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void | Response {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
}

export { pool };
