# Standard Logger JS

A standardized logging library for JavaScript that implements a unified logging format according to corporate standards.

## Installation

```bash
npm install @stepstone/standard-logger
```

## Key Features

* Standardized log format
* Express.js integration
* Distributed request tracing support
* Automatic HTTP request logging
* Full TypeScript support

## Usage Examples

### Basic Usage

```typescript
import { createLogger } from '@stepstone/standard-logger';

// Create a logger that automatically detects package information
const logger = createLogger(__filename);

// Use different logging levels
logger.info('Application started');
logger.debug('Processing request', { userId: 123 });
logger.error('Failed to connect to database', new Error('Connection refused'));
```

### Express Integration

```typescript
import express from 'express';
import { loggerMiddleware } from '@stepstone/standard-logger';

const app = express();

// Configure the application
app.set('name', 'my-service');
app.set('version', '1.0.0');

// Add middleware for request logging
app.use(loggerMiddleware());

app.get('/', (req, res) => {
  // Use the logger from the request object
  req.logger.info('Processing request');
  res.send('Hello World');
});

app.listen(3000);
```

## Logging Levels

The library supports the following logging levels:

* `TRACE` - Detailed information for debugging
* `DEBUG` - Debugging information
* `INFO` - General information
* `WARN` - Warnings
* `ERROR` - Errors
* `CRITICAL` - Critical errors

## Log Format

The library generates logs in a standardized JSON format:

```json
{
  "level": "INFO",
  "message": "Application started",
  "logger": "/app/src/index.js",
  "schemaVersion": "1.0.0",
  "datetime": "2025-05-07T14:23:05.123Z",
  "service": {
    "name": "my-service",
    "version": "1.0.0",
    "environment": "development"
  },
  "request": {
    "method": "GET",
    "uri": "/api/users"
  },
  "context": {
    "userId": 123
  }
}
```

## API Reference

### `createLogger(filePathOrOptions)`

Creates a new logger instance.

**Parameters:**
* `filePathOrOptions`: Either a file path string or a LoggerOptions object.

**Returns:**
* A Logger instance.

### `loggerMiddleware(options?)`

Creates an Express middleware for request logging.

**Parameters:**
* `options` (optional): Configuration options for the middleware.
   * `logRequests`: Whether to log incoming requests (default: true)
   * `logResponses`: Whether to log responses (default: true)

**Returns:**
* An Express middleware function.

## Logger Methods

* `logger.trace(message, context?)` - Log at TRACE level
* `logger.debug(message, context?)` - Log at DEBUG level
* `logger.info(message, context?)` - Log at INFO level
* `logger.warn(message, context?)` - Log at WARN level
* `logger.error(message, context?)` - Log at ERROR level
* `logger.critical(message, context?)` - Log at CRITICAL level

## Development

### Installing Dependencies

```bash
npm install
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Running Examples

```bash
npm run example:basic
npm run example:express
```

## Contributing

Please ensure that your contributions adhere to the following guidelines:

1. Follow the coding style established by ESLint and Prettier configurations.
2. Write tests for new features.
3. Update documentation when necessary.
4. Respect the log format specification.

## License

MIT