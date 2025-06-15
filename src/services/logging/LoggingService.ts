
/**
 * Centralized logging service with configurable levels and structured output
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class LoggingService {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'warn';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.logLevel];
  }

  private formatMessage(level: LogLevel, category: string, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (level === 'error' && data instanceof Error) {
      entry.stack = data.stack;
    }

    return entry;
  }

  private output(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.category}:`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.data || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case 'error':
        console.error(prefix, entry.message, entry.data || '', entry.stack || '');
        break;
    }
  }

  debug(category: string, message: string, data?: any) {
    const entry = this.formatMessage('debug', category, message, data);
    this.output(entry);
  }

  info(category: string, message: string, data?: any) {
    const entry = this.formatMessage('info', category, message, data);
    this.output(entry);
  }

  warn(category: string, message: string, data?: any) {
    const entry = this.formatMessage('warn', category, message, data);
    this.output(entry);
  }

  error(category: string, message: string, data?: any) {
    const entry = this.formatMessage('error', category, message, data);
    this.output(entry);
  }

  // Analysis-specific logging methods
  analysisStart(assessmentId: string, type: string) {
    this.info('ANALYSIS', `Starting ${type} analysis`, { assessmentId });
  }

  analysisComplete(assessmentId: string, type: string, duration?: number) {
    this.info('ANALYSIS', `Completed ${type} analysis`, { assessmentId, duration });
  }

  analysisError(assessmentId: string, type: string, error: any) {
    this.error('ANALYSIS', `Failed ${type} analysis`, { assessmentId, error: error.message || error });
  }

  // Performance logging
  performanceStart(operation: string) {
    if (this.isDevelopment) {
      console.time(`PERF: ${operation}`);
    }
  }

  performanceEnd(operation: string) {
    if (this.isDevelopment) {
      console.timeEnd(`PERF: ${operation}`);
    }
  }

  // API request logging
  apiRequest(method: string, endpoint: string, data?: any) {
    this.debug('API', `${method} ${endpoint}`, data ? { requestData: data } : undefined);
  }

  apiResponse(method: string, endpoint: string, status: number, data?: any) {
    this.debug('API', `${method} ${endpoint} - ${status}`, data ? { responseData: data } : undefined);
  }

  apiError(method: string, endpoint: string, error: any) {
    this.error('API', `${method} ${endpoint} failed`, error);
  }
}

export const logger = new LoggingService();
