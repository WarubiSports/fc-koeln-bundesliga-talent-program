import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { attachAppContext } from '../../middleware/appContext';

// Mock the database
vi.mock('../../db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
  },
}));

describe('attachAppContext Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      appCtx: undefined,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    process.env.NODE_ENV = 'test';
  });

  describe('Development Mode - Localhost Bypass', () => {
    it('should auto-default to fckoln app for localhost requests without API key', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {};
      
      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.appCtx).toEqual({
        id: 'fckoln',
        name: '1.FC Köln ITP',
        origins: ['http://localhost:5173', 'http://localhost:5000'],
        rps: 600,
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should auto-default for requests with localhost origin', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {
        origin: 'http://localhost:5173',
      };
      
      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.appCtx?.id).toBe('fckoln');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should auto-default for requests with 127.0.0.1 origin', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {
        origin: 'http://127.0.0.1:5000',
      };
      
      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.appCtx?.id).toBe('fckoln');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('API Key Authentication', () => {
    it('should return 401 when no API key is provided in production', async () => {
      process.env.NODE_ENV = 'production';
      mockReq.headers = {};

      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing X-App-Key header',
        message: 'All requests must include a valid app API key',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for non-localhost requests without API key in development', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {
        origin: 'https://external-domain.com',
      };

      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Request Context', () => {
    it('should attach app context to request object', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {};

      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.appCtx).toBeDefined();
      expect(mockReq.appCtx).toHaveProperty('id');
      expect(mockReq.appCtx).toHaveProperty('name');
      expect(mockReq.appCtx).toHaveProperty('origins');
      expect(mockReq.appCtx).toHaveProperty('rps');
    });

    it('should set correct rate limit value', async () => {
      process.env.NODE_ENV = 'development';
      mockReq.headers = {};

      await attachAppContext(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockReq.appCtx?.rps).toBe(600);
    });
  });
});
