import { Logger } from './core/logger';//??
import { PinoAdapter } from './core/pino-adapter';//??
import { loggerMiddleware } from './middleware/express'; //??
import { LoggerOptions } from './interfaces/logger-options';

// Re-export of main components
export { Logger } from './core/logger'; //??
export { PinoAdapter } from './core/pino-adapter';//??
export { loggerMiddleware } from './middleware/express';//??
export { LogFormatter } from './core/formatter';

// Export constants
export { LogLevel } from './constants/log-levels';
export { HttpContextKey } from './constants/http-context-keys';

// Export interfaces
export * from './interfaces';

// Export utilities
export { getPackageInfo } from './utils/package-info';
export { getContextStore, setContext, runWithContext } from './middleware/context-store';

// Function for convenient creation of a logger
export function createLogger(filePathOrOptions: string | LoggerOptions): Logger {
  return new Logger(filePathOrOptions);
}

// Default export
export default { createLogger, Logger, PinoAdapter, loggerMiddleware };