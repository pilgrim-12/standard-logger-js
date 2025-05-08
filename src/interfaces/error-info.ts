/**
 * Error information 
 */
export interface ErrorInfo {
    message: string;
    type: string;
    stacktrace?: string;
    data?: Record<string, any>;
    inner?: ErrorInfo;
  }