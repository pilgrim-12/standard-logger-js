import { ErrorInfo } from '../interfaces/error-info';

/**
 * Formatting logs and errors
 */
export class LogFormatter {
  /**
   * Formats the error for inclusion in the log
   */
  static formatError(error: Error): ErrorInfo {
    
    const errorInfo: ErrorInfo = {
      message: error.message,
      type: error.constructor.name,
      stacktrace: error.stack
    };

    // Adding additional error properties
    const data: Record<string, any> = {};

    Object.getOwnPropertyNames(error).forEach(key => {
      if (!['name', 'message', 'stack'].includes(key)) {
        data[key] = (error as any)[key];
      }
    });

    if (Object.keys(data).length > 0) {
      errorInfo.data = data;
    }

    // Handling nested errors
    if ((error as any).cause && (error as any).cause instanceof Error) {
      errorInfo.inner = LogFormatter.formatError((error as any).cause);
    }

    return errorInfo;
  }

  /**
   * Formats a timestamp in ISO 8601 format
   */
  static formatTimestamp(date: Date = new Date()): string {
    return date.toISOString();
  }
}