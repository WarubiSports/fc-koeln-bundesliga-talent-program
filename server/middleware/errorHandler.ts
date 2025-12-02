import type { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, JsonParseError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function jsonParseErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof SyntaxError && 'body' in err) {
    const jsonError = new JsonParseError((err as any).message);
    logger.warn('JSON parse error', {
      path: req.path,
      method: req.method,
      error: err.message,
      correlationId: req.correlationId
    });
    res.status(400).json({
      success: false,
      error: jsonError.code,
      message: jsonError.message,
      correlationId: req.correlationId
    });
    return;
  }
  next(err);
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isAppError(err)) {
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      correlationId: req.correlationId
    });

    const response: Record<string, any> = {
      success: false,
      error: err.code,
      message: err.message,
      correlationId: req.correlationId
    };

    if ('errors' in err && Array.isArray((err as any).errors)) {
      response.errors = (err as any).errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId
  });

  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred',
    correlationId: req.correlationId
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
