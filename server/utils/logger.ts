/**
 * Structured logging utility
 * Replaces console.log with proper log levels and structured output
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context })
    };
  }

  private output(entry: LogEntry) {
    // In production, this could send to external logging service
    const formatted = JSON.stringify(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.log(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.output(this.formatLog('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.output(this.formatLog('warn', message, context));
  }

  error(message: string, error?: Error | any, context?: Record<string, any>) {
    const errorContext = error instanceof Error 
      ? { error: error.message, stack: error.stack, ...context }
      : { error, ...context };
    this.output(this.formatLog('error', message, errorContext));
  }

  debug(message: string, context?: Record<string, any>) {
    this.output(this.formatLog('debug', message, context));
  }
}

export const logger = new Logger();
