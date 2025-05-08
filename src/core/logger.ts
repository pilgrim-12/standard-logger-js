import pino from 'pino';
import { PinoAdapter } from './pino-adapter';
import { LogFormatter } from './formatter';
import { LogLevel } from '../constants/log-levels';
import { LogEntry } from '../interfaces/log-entry';
import { LoggerOptions } from '../interfaces/logger-options';
import { getPackageInfo } from '../utils/package-info';
import { getContextStore } from '../middleware/context-store';
import { HttpContextKey } from '../constants/http-context-keys';

/**
 * Main logger class
 */
export class Logger {
  private loggerName: string;
  private options: LoggerOptions;
  private pinoLogger: pino.Logger;

  /**
   * Creates a new logger instance
   */
  constructor(filePathOrOptions: string | LoggerOptions) {
    if (typeof filePathOrOptions === 'string') {
      const packageInfo = getPackageInfo(filePathOrOptions);
      this.loggerName = filePathOrOptions;
      this.options = {
        service: {
          name: packageInfo.name,
          version: packageInfo.version,
          environment: packageInfo.environment
        },
        schemaVersion: '1.0.0'
      };
    } else {
      this.options = filePathOrOptions;
      this.loggerName = filePathOrOptions.logger || 'unknown';
    }

    // Get an instance of Pino
    this.pinoLogger = PinoAdapter.getLogger();
  }

  /**
   * TRACE level logging
   */
  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * Logging at DEBUG level
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logging at INFO level
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logging at WARN level
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logging at ERROR level
   */
  error(message: string, context?: Record<string, any> | Error): void {
    // Check if the context is an error object
    if (context instanceof Error) {
      const errorInfo = LogFormatter.formatError(context);
      this.log(LogLevel.ERROR, message, { error: errorInfo });
    } else {
      this.log(LogLevel.ERROR, message, context);
    }
  }

  /**
   * Логирование на уровне CRITICAL
   */
  critical(message: string, context?: Record<string, any> | Error): void {
    // Check if the context is an error object
    if (context instanceof Error) {
      const errorInfo = LogFormatter.formatError(context);
      this.log(LogLevel.CRITICAL, message, { error: errorInfo });
    } else {
      this.log(LogLevel.CRITICAL, message, context);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry = this.createLogEntry(level, message, context);
    const pinoLevel = PinoAdapter.mapLogLevel(level);
    
    // Using Pino for logging
    this.pinoLogger[pinoLevel](logEntry);
  }

  /**
   * Creating a log entry
   */
  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    const contextStore = getContextStore();
    
    const entry: LogEntry = {
      level,
      message,
      logger: this.loggerName,
      schemaVersion: this.options.schemaVersion || '1.0.0',
      datetime: new Date().toISOString(),
      service: {
        name: this.options.service.name,
        version: this.options.service.version,
        environment: this.options.service.environment,
        ip: contextStore.get(HttpContextKey.ServiceIp),
        port: contextStore.get(HttpContextKey.ServicePort)
      },
      request: {
        method: contextStore.get(HttpContextKey.Method) || 'NONE',
        uri: contextStore.get(HttpContextKey.Uri) || 'NONE',
        baggage: contextStore.get(HttpContextKey.Baggage),
        clientIp: contextStore.get(HttpContextKey.ClientIp),
        sourceSystem: contextStore.get(HttpContextKey.SourceSystem),
        id: contextStore.get(HttpContextKey.RequestId)
      }
    };

    // Add tracing if there is one
    const traceId = contextStore.get(HttpContextKey.TraceId);
    const spanId = contextStore.get(HttpContextKey.SpanId);
    
    if (traceId) entry.traceId = traceId;
    if (spanId) entry.spanId = spanId;

    // Add user context if it exists
    if (context && Object.keys(context).length > 0) {
      // Handling the case where an error is passed in context
      if (context.error) {
        entry.error = context.error instanceof Error
          ? LogFormatter.formatError(context.error)
          : context.error;
        
        // Remove error from context to avoid duplication
        const { error, ...restContext } = context;
        
        // Add the rest of the context if there is any.
        if (Object.keys(restContext).length > 0) {
          entry.context = restContext;
        }
      } else {
        entry.context = context;
      }
    }

    return entry;
  }
}