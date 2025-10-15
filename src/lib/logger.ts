// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry = this.formatMessage(level, message, metadata);
    
    if (this.isDevelopment) {
      console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.metadata);
    } else {
      // In production, you might want to send to a logging service
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }
}

export const logger = new Logger();
