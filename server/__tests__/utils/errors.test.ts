import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  BadRequestError,
  JsonParseError,
  AIServiceError,
  DatabaseError,
  isAppError,
  isOperationalError
} from '../../utils/errors.js';

describe('AppError', () => {
  it('should create error with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('should create error with custom values', () => {
    const error = new AppError('Custom error', 418, 'TEAPOT', false);
    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.isOperational).toBe(false);
  });

  it('should be an instance of Error', () => {
    const error = new AppError('Test');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });
});

describe('ValidationError', () => {
  it('should create with errors array', () => {
    const errors = ['Field 1 is required', 'Field 2 is invalid'];
    const error = new ValidationError('Validation failed', errors);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.errors).toEqual(errors);
  });

  it('should default to empty errors array', () => {
    const error = new ValidationError('Validation failed');
    expect(error.errors).toEqual([]);
  });
});

describe('NotFoundError', () => {
  it('should create with default message', () => {
    const error = new NotFoundError();
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create with custom resource name', () => {
    const error = new NotFoundError('User');
    expect(error.message).toBe('User not found');
  });
});

describe('UnauthorizedError', () => {
  it('should create with default message', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Authentication required');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });
});

describe('ForbiddenError', () => {
  it('should create with default message', () => {
    const error = new ForbiddenError();
    expect(error.message).toBe('Access denied');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('RateLimitError', () => {
  it('should create with correct status code', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('BadRequestError', () => {
  it('should create with correct status code', () => {
    const error = new BadRequestError('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });
});

describe('JsonParseError', () => {
  it('should create with details', () => {
    const error = new JsonParseError('Unexpected token');
    expect(error.message).toBe('Invalid JSON: Unexpected token');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('JSON_PARSE_ERROR');
  });

  it('should create without details', () => {
    const error = new JsonParseError();
    expect(error.message).toBe('Invalid JSON in request body');
  });
});

describe('AIServiceError', () => {
  it('should create with correct status code', () => {
    const error = new AIServiceError();
    expect(error.statusCode).toBe(503);
    expect(error.code).toBe('AI_SERVICE_ERROR');
  });
});

describe('DatabaseError', () => {
  it('should be marked as non-operational', () => {
    const error = new DatabaseError('Connection failed');
    expect(error.isOperational).toBe(false);
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('DATABASE_ERROR');
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    expect(isAppError(new AppError('test'))).toBe(true);
    expect(isAppError(new ValidationError('test'))).toBe(true);
    expect(isAppError(new NotFoundError())).toBe(true);
  });

  it('should return false for regular errors', () => {
    expect(isAppError(new Error('test'))).toBe(false);
    expect(isAppError(new TypeError('test'))).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});

describe('isOperationalError', () => {
  it('should return true for operational errors', () => {
    expect(isOperationalError(new AppError('test'))).toBe(true);
    expect(isOperationalError(new ValidationError('test'))).toBe(true);
  });

  it('should return false for non-operational errors', () => {
    expect(isOperationalError(new DatabaseError('test'))).toBe(false);
    expect(isOperationalError(new AppError('test', 500, 'TEST', false))).toBe(false);
  });

  it('should return false for regular errors', () => {
    expect(isOperationalError(new Error('test'))).toBe(false);
  });
});
