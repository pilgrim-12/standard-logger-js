import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { HttpContextKey } from '../constants/http-context-keys';
import { runWithContext, setContext } from './context-store';
import { Logger } from '../core/logger';

/**
 * Options for middleware
 */
export interface MiddlewareOptions {
  logRequests?: boolean;
  logResponses?: boolean;
}

/**
 * Express middleware for logging
 */
export function loggerMiddleware(options: MiddlewareOptions = {}) {
  const defaultOptions: MiddlewareOptions = {
    logRequests: true,
    logResponses: true
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    runWithContext(() => {
      try {
        const requestId = req.headers['x-request-id'] as string || uuidv4();
        const traceId = req.headers['traceparent'] as string || req.headers['x-trace-id'] as string || requestId;
        const spanId = req.headers['x-span-id'] as string || uuidv4();
        
        // Set headers for tracing
        res.setHeader('x-request-id', requestId);
        res.setHeader('x-trace-id', traceId);
        
        // Store request information in context
        setContext(HttpContextKey.RequestId, requestId);
        setContext(HttpContextKey.TraceId, traceId);
        setContext(HttpContextKey.SpanId, spanId);
        setContext(HttpContextKey.Method, req.method);
        setContext(HttpContextKey.Uri, `${req.protocol}://${req.get('host')}${req.originalUrl}`);
        setContext(HttpContextKey.ClientIp, req.ip);
        setContext(HttpContextKey.SourceSystem, req.headers['source-system']);
        
        // Service information
        setContext(HttpContextKey.ServiceIp, req.socket.localAddress);
        setContext(HttpContextKey.ServicePort, req.socket.localPort?.toString());
        
        // Create a logger - prefer Express app configuration
        let logger: Logger;

        if (req.app.get('name') && req.app.get('version')) {

          logger = new Logger({
            service: {
              name: req.app.get('name'),
              version: req.app.get('version'),
              environment: process.env.NODE_ENV || 'development'
            }
          });

        } else {
          // Fallback to file-based logger
          logger = new Logger(__filename);
        }
        
        // Add a logger to the request object for use in handlers
        (req as any).logger = logger;
        
        // Log the start of the request if configured
        if (mergedOptions.logRequests) {
          logger.info(`Request started: ${req.method} ${req.originalUrl}`);
        }
        
        // Track the completion of the request
        if (mergedOptions.logResponses) {
          const startTime = Date.now();
          let responseLogged = false;
          
          // Function for logging the response (prevent double logging)
          const logResponse = () => {
            if (responseLogged) return;
            responseLogged = true;
            
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;
            const level = statusCode >= 400 ? 'error' : 'info';
            const message = `Request completed: ${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`;
            
            if (level === 'error') {

              logger.error(message, {
                statusCode,
                duration,
                path: req.originalUrl
              });

            } else {

              logger.info(message, {
                statusCode,
                duration,
                path: req.originalUrl
              });

            }
          };
          
          // Add handlers for various request completion events
          res.on('finish', logResponse);
          res.on('close', logResponse);
          res.on('error', (error) => {
            if (!responseLogged) {
              responseLogged = true;
              logger.error(`Request error: ${req.method} ${req.originalUrl}`, error);
            }
          });
        }
        
        next();

      } catch (error) {
        // In case of an error in the middleware, we log it and pass it on
        console.error('Error in logger middleware:', error);

        // Create a fallback logger without context
        const fallbackLogger = new Logger({
          service: {
            name: 'logger-middleware',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development'
          }
        });

        fallbackLogger.error('Error in logger middleware', error instanceof Error ? error : new Error(String(error)));

        next(error);
        
      }
    });
  };
}