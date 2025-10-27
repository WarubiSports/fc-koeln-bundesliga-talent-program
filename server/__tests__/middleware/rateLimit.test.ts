import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { rateLimitPerApp } from '../../middleware/rateLimit';

describe('Rate Limiting Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      appCtx: {
        id: 'test-app',
        name: 'Test App',
        origins: [],
        rps: 10, // 10 requests per minute for testing
      },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();

    // Clear rate limit store between tests
    vi.clearAllMocks();
  });

  it('should allow requests under the rate limit', () => {
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should set rate limit headers', () => {
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
  });

  it('should track requests per app separately', () => {
    // First app
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);

    // Second app with different ID
    mockReq.appCtx = {
      id: 'another-app',
      name: 'Another App',
      origins: [],
      rps: 10,
    };
    
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it('should respect per-app rate limits', () => {
    mockReq.appCtx!.rps = 2; // Very low limit

    // First request - should pass
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Second request - should pass
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();

    // Third request - should be rate limited
    const mockNext3 = vi.fn();
    rateLimitPerApp(mockReq as Request, mockRes as Response, mockNext3);
    
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Rate limit exceeded',
      message: expect.stringContaining('Too many requests'),
    });
  });
});
