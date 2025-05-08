import pino from 'pino';
import { PinoOptions } from '../interfaces/pino-options';
import { LogLevel } from '../constants/log-levels';

/**
 * Adapter for Pino
 */
export class PinoAdapter {
  private static instance: pino.Logger;

  /**
   * Initialize Pino with settings for standard logging format
   */
  static initialize(customOptions?: PinoOptions): pino.Logger {
    if (!PinoAdapter.instance) {
      const defaultOptions: pino.LoggerOptions = {
        // Disable standard Pino fields
        timestamp: () => `,"datetime":"${new Date().toISOString()}"`,
        base: null,
        
        // Set up formatting
        formatters: {
          level: (label) => {
            // Mapping Pino levels to our standard levels
            const levelMap: Record<string, LogLevel> = {
              trace: LogLevel.TRACE,
              debug: LogLevel.DEBUG,
              info: LogLevel.INFO,
              warn: LogLevel.WARN,
              error: LogLevel.ERROR,
              fatal: LogLevel.CRITICAL,
            };
            return { level: levelMap[label] || LogLevel.INFO };
          },
          bindings: () => ({}), // Remove standard bindings
        },
        
        // Serializers for special objects
        serializers: {
          error: pino.stdSerializers.err,
          // Additional serializers as needed
        }
      };

      // Combine basic settings with custom ones
      const options = { ...defaultOptions, ...customOptions };
      PinoAdapter.instance = pino(options);
    }

    return PinoAdapter.instance;
  }

  /**
   * Getting an instance of the Pino logger
   */
  static getLogger(): pino.Logger {
    if (!PinoAdapter.instance) {
      return PinoAdapter.initialize();
    }
    return PinoAdapter.instance;
  }

  /**
   * Convert standard logging level to Pino level
   */
  static mapLogLevel(level: LogLevel): pino.Level {
    const levelMap: Record<LogLevel, pino.Level> = {
      [LogLevel.TRACE]: 'trace',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warn',
      [LogLevel.ERROR]: 'error',
      [LogLevel.CRITICAL]: 'fatal',
    };

    return levelMap[level] || 'info';
  }
}