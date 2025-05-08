import { LogLevel } from '../constants/log-levels';
import { ServiceInfo } from './service-info';
import { RequestInfo } from './request-info';
import { ErrorInfo } from './error-info';

/**
 * Logging interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  logger: string;
  schemaVersion: string;
  datetime: string;
  service: ServiceInfo;
  request: RequestInfo;
  context?: Record<string, any>;
  spanId?: string;
  traceId?: string;
  error?: ErrorInfo;
}