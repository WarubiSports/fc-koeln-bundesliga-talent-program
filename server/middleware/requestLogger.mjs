import crypto from 'crypto';

export function requestLogger(options = {}) {
  const { 
    skipPaths = ['/health', '/favicon.ico'],
    logBody = false,
    sensitiveFields = ['password', 'token', 'secret', 'authorization']
  } = options;

  return (req, res, next) => {
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    const startTime = Date.now();

    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent']?.substring(0, 100),
        ip: req.ip || req.connection?.remoteAddress,
        appId: req.appCtx?.id
      };

      if (req.userId) {
        logEntry.userId = req.userId;
      }

      if (logBody && req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };
        sensitiveFields.forEach(field => {
          if (sanitizedBody[field]) {
            sanitizedBody[field] = '[REDACTED]';
          }
        });
        logEntry.body = sanitizedBody;
      }

      const level = res.statusCode >= 500 ? 'error' : 
                    res.statusCode >= 400 ? 'warn' : 'info';
      
      console.log(JSON.stringify({ level, ...logEntry }));
      
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

export function errorLogger() {
  return (err, req, res, next) => {
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      error: {
        message: err.message,
        name: err.name,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
      },
      appId: req.appCtx?.id,
      userId: req.userId
    };

    console.error(JSON.stringify(logEntry));

    if (!res.headersSent) {
      res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
        correlationId: req.correlationId
      });
    }
  };
}
