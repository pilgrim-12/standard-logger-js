 
const { createLogger } = require('../../dist');

// Create a logger
const logger = createLogger({
  service: {
    name: 'example-app',
    version: '1.0.0',
    environment: 'development'
  }
});

// Examples of logging at different levels
logger.info('Application started');
logger.debug('Processing data', { userId: 123, action: 'login' });
logger.warn('Resource usage high', { cpuUsage: '75%', memoryUsage: '60%' });

// Error logging
try {
  throw new Error('Connection refused');
} catch (error) {
// Direct error transmission
  logger.error('Failed to connect to database', error);
  
// Or with additional context
  logger.error('Operation failed', { 
    error,
    context: { operation: 'db-query', timestamp: Date.now() }
  });
}

// Critical error
logger.critical('System crash imminent', { 
  reason: 'Out of memory',
  availableMemory: '50MB'
});

console.log('Logs have been generated!');