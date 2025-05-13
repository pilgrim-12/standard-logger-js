import pino from 'pino';
import { PinoOptions } from '../interfaces/pino-options';
import { LogLevel } from '../constants/log-levels';

/**
 * Adapter for Pino
 */
export class PinoAdapter {
  private static instance: pino.Logger;

  /**
   * Initialize Pino with minimum interference
   */
  static initialize(customOptions?: PinoOptions): pino.Logger {
    if (!PinoAdapter.instance) {
      // Create a custom stream that just outputs the object as JSON
      const stream = {
        write: (obj: any) => {
          // Parse the object and remove any unwanted fields
          try {
            const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj;
            
            // Remove Pino's time field if it exists and is numeric
            if (typeof parsed.time === 'number') {
              delete parsed.time;
            }
            
            // Remove Pino's level field if it's numeric
            if (typeof parsed.level === 'number') {
              delete parsed.level;
            }
            
            // Output clean JSON
            process.stdout.write(JSON.stringify(parsed) + '\n');
          } catch (e) {
            // If anything fails, just stringify the object
            process.stdout.write(JSON.stringify(obj) + '\n');
          }
        }
      };

      PinoAdapter.instance = pino({
        level: 'trace',
        base: null,
        timestamp: false,
        ...customOptions
      }, stream);
    }

    return PinoAdapter.instance;
  }

  /**
   * Get an instance of the Pino logger
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