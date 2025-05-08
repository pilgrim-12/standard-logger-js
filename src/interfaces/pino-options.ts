import pino from 'pino';

/**
 * Expanding Pino options for our library
 */
export interface PinoOptions extends pino.LoggerOptions {
  /**
   * Additional parameters specific to our implementation
   */
  customFormatting?: boolean;
  includeTimestamp?: boolean;
}