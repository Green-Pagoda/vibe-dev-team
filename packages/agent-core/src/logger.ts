/**
 * Structured logging utility for agents
 * 
 * Provides consistent, structured logging across all agents with context
 * and proper log levels. Uses JSON format for better observability.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  agentName?: string;
  agentVersion?: string;
  executionId?: string;
  projectId?: string;
  issueId?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  debug(message: string, additionalContext?: LogContext): void {
    this.log(LogLevel.DEBUG, message, additionalContext);
  }

  info(message: string, additionalContext?: LogContext): void {
    this.log(LogLevel.INFO, message, additionalContext);
  }

  warn(message: string, additionalContext?: LogContext): void {
    this.log(LogLevel.WARN, message, additionalContext);
  }

  error(message: string, error?: Error, additionalContext?: LogContext): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context: { ...this.context, ...additionalContext },
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    console.error(JSON.stringify(logEntry));
  }

  private log(level: LogLevel, message: string, additionalContext?: LogContext): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...additionalContext },
    };

    // Use appropriate console method based on level
    const consoleMethod = level === LogLevel.ERROR ? console.error :
                         level === LogLevel.WARN ? console.warn :
                         console.log;

    consoleMethod(JSON.stringify(logEntry));
  }

  // Create a child logger with additional context
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

// Factory function for creating agent loggers
export function createAgentLogger(agentName: string, agentVersion: string): Logger {
  return new Logger({
    agentName,
    agentVersion,
  });
}