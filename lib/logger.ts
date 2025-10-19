/**
 * Centralized Logging Service
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Contextual logging (route, user action, etc.)
 * - Environment-aware (verbose in dev, minimal in prod)
 * - Optional remote logging endpoint
 * - Performance tracking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  route?: string;
  action?: string;
  userId?: string;
  timestamp?: number;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
}

class Logger {
  private isDevelopment: boolean;
  private enableRemoteLogging: boolean;
  private remoteEndpoint?: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.enableRemoteLogging = import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true';
    this.remoteEndpoint = import.meta.env.VITE_LOGGING_ENDPOINT;
  }

  /**
   * Format log entry for console
   */
  private formatConsoleLog(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry;
    const time = new Date(timestamp).toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    
    return `[${time}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  /**
   * Get console method based on log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Send logs to remote endpoint (batch)
   */
  private async sendToRemote(entries: LogEntry[]): Promise<void> {
    if (!this.enableRemoteLogging || !this.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: entries })
      });
    } catch (error) {
      // Silently fail remote logging to avoid infinite loops
      console.warn('Failed to send logs to remote endpoint', error);
    }
  }

  /**
   * Add log entry to buffer and flush if needed
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Flush log buffer to remote endpoint
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    await this.sendToRemote(entries);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      context: {
        ...context,
        route: context?.route || window.location.pathname,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    // Console output (always in dev, only warn/error in prod)
    if (this.isDevelopment || level === 'warn' || level === 'error') {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(this.formatConsoleLog(entry));
    }

    // Add to buffer for remote logging
    if (level === 'warn' || level === 'error') {
      this.addToBuffer(entry);
    }
  }

  /**
   * Public logging methods
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext | Error): void {
    let errorContext: LogContext = {};

    if (context instanceof Error) {
      errorContext = {
        errorName: context.name,
        errorMessage: context.message,
        errorStack: context.stack
      };
    } else if (context) {
      errorContext = context;
    }

    this.log('error', message, errorContext);
  }

  /**
   * Performance tracking
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.info(`⏱️ ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * Log user action
   */
  logUserAction(action: string, context?: LogContext): void {
    this.info(`👤 User action: ${action}`, {
      ...context,
      action,
      userAgent: navigator.userAgent
    });
  }

  /**
   * Log navigation
   */
  logNavigation(from: string, to: string, context?: LogContext): void {
    this.info(`🧭 Navigation: ${from} → ${to}`, {
      ...context,
      from,
      to
    });
  }

  /**
   * Get log history (for debugging)
   */
  getLogHistory(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clear(): void {
    this.logBuffer = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext, LogEntry };
