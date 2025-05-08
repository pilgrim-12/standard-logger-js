import { Logger } from '../core/logger';

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
    }
  }
}