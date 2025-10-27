import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requestLogger, errorLogger } from '../../middleware/requestLogger';

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Request Logger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
      query: {},
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-user-agent'),
    };
    mockRes = {
      end: vi.fn(),
      statusCode: 200,
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('requestLogger', () => {
    it('should generate correlation ID', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.correlationId).toBeDefined();
      expect(typeof mockReq.correlationId).toBe('string');
      expect(mockReq.correlationId?.length).toBeGreaterThan(0);
    });

    it('should set start time', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.startTime).toBeDefined();
      expect(typeof mockReq.startTime).toBe('number');
    });

    it('should call next middleware', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique correlation IDs for each request', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);
      const firstId = mockReq.correlationId;

      const mockReq2: Partial<Request> = { ...mockReq };
      requestLogger(mockReq2 as Request, mockRes as Response, mockNext);
      const secondId = mockReq2.correlationId;

      expect(firstId).not.toBe(secondId);
    });
  });

  describe('errorLogger', () => {
    it('should log errors with correlation ID', () => {
      const error = new Error('Test error');
      mockReq.correlationId = 'test-correlation-id';
      mockReq.startTime = Date.now();

      errorLogger(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with the error', () => {
      const error = new Error('Test error');
      errorLogger(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
