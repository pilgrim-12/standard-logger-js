
const express = require('express');
const { loggerMiddleware, createLogger } = require('../../dist');

// Create a logger for the application
const appLogger = createLogger({
  service: {
    name: 'express-example',
    version: '1.0.0',
    environment: 'development'
  }
});
 
const app = express();

// Configure application metadata
app.set('name', 'express-example');
app.set('version', '1.0.0');
app.set('port', process.env.PORT || 3000);

// Add middleware for logging requests
app.use(loggerMiddleware());

// Add routes
app.get('/', (req, res) => {
// Use the logger from the request object (middleware added)
  req.logger.info('Processing root request');
  res.send('Hello World!');
});

app.get('/error', (req, res, next) => {
// Simulate an error
  req.logger.info('About to throw an error');
  next(new Error('Simulated error'));
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  req.logger.info(`Getting user data`, { userId });
  
// Simulation of working with data
  if (userId === '123') {
    res.json({ id: userId, name: 'John Doe', email: 'john@example.com' });
  } else {
    req.logger.warn(`User not found`, { userId });
    res.status(404).json({ error: 'User not found' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  req.logger.error('Unhandled exception', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
const PORT = app.get('port');
app.listen(PORT, () => {
  appLogger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});