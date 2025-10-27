import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// In-memory metrics storage (per app)
interface AppMetrics {
  requestCount: number;
  errorCount: number;
  totalDuration: number;
  statusCodes: Map<number, number>;
  lastReset: number;
}

const metricsStore = new Map<string, AppMetrics>();
const METRICS_RESET_INTERVAL = 60 * 60 * 1000; // Reset hourly

/**
 * Get or create metrics for an app
 */
function getMetrics(appId: string): AppMetrics {
  let metrics = metricsStore.get(appId);
  
  if (!metrics) {
    metrics = {
      requestCount: 0,
      errorCount: 0,
      totalDuration: 0,
      statusCodes: new Map(),
      lastReset: Date.now(),
    };
    metricsStore.set(appId, metrics);
  }

  // Reset if interval elapsed
  if (Date.now() - metrics.lastReset > METRICS_RESET_INTERVAL) {
    metrics.requestCount = 0;
    metrics.errorCount = 0;
    metrics.totalDuration = 0;
    metrics.statusCodes.clear();
    metrics.lastReset = Date.now();
  }

  return metrics;
}

/**
 * Middleware: Collect metrics per app
 */
export function metricsCollector(req: Request, res: Response, next: NextFunction) {
  const appId = req.appCtx?.id;
  
  if (!appId) {
    return next();
  }

  const metrics = getMetrics(appId);
  metrics.requestCount++;

  // Capture original end function
  const originalEnd = res.end;

  // Override res.end to track completion
  res.end = function(this: Response, ...args: any[]) {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const statusCode = res.statusCode;

    // Update metrics
    metrics.totalDuration += duration;
    metrics.statusCodes.set(statusCode, (metrics.statusCodes.get(statusCode) || 0) + 1);

    if (statusCode >= 400) {
      metrics.errorCount++;
    }

    // Log metrics periodically (every 100 requests)
    if (metrics.requestCount % 100 === 0) {
      const avgDuration = metrics.totalDuration / metrics.requestCount;
      const errorRate = (metrics.errorCount / metrics.requestCount) * 100;

      logger.info('App metrics summary', {
        appId,
        requestCount: metrics.requestCount,
        errorCount: metrics.errorCount,
        errorRate: `${errorRate.toFixed(2)}%`,
        avgDuration: `${avgDuration.toFixed(2)}ms`,
        statusCodes: Object.fromEntries(metrics.statusCodes),
      });
    }

    return originalEnd.apply(this, args);
  };

  next();
}

/**
 * Get current metrics for all apps
 */
export function getAllMetrics() {
  const result: Record<string, any> = {};
  
  metricsStore.forEach((metrics, appId) => {
    const avgDuration = metrics.requestCount > 0 
      ? metrics.totalDuration / metrics.requestCount 
      : 0;
    const errorRate = metrics.requestCount > 0
      ? (metrics.errorCount / metrics.requestCount) * 100
      : 0;

    result[appId] = {
      requestCount: metrics.requestCount,
      errorCount: metrics.errorCount,
      errorRate: `${errorRate.toFixed(2)}%`,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      statusCodes: Object.fromEntries(metrics.statusCodes),
      periodStart: new Date(metrics.lastReset).toISOString(),
    };
  });

  return result;
}

/**
 * Get metrics for a specific app
 */
export function getAppMetrics(appId: string) {
  const metrics = metricsStore.get(appId);
  
  if (!metrics) {
    return {
      requestCount: 0,
      errorCount: 0,
      errorRate: '0%',
      avgDuration: '0ms',
      statusCodes: {},
    };
  }

  const avgDuration = metrics.requestCount > 0 
    ? metrics.totalDuration / metrics.requestCount 
    : 0;
  const errorRate = metrics.requestCount > 0
    ? (metrics.errorCount / metrics.requestCount) * 100
    : 0;

  return {
    requestCount: metrics.requestCount,
    errorCount: metrics.errorCount,
    errorRate: `${errorRate.toFixed(2)}%`,
    avgDuration: `${avgDuration.toFixed(2)}ms`,
    statusCodes: Object.fromEntries(metrics.statusCodes),
    periodStart: new Date(metrics.lastReset).toISOString(),
  };
}
