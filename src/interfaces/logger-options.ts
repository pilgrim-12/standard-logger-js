import { ServiceInfo } from './service-info';

/**
 * Options for creating a logger
 */
export interface LoggerOptions {
  service: ServiceInfo;
  schemaVersion?: string;
  logger?: string;
}