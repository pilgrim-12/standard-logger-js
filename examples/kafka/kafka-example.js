const { createLogger } = require('../../dist');

// Создаем логгер
const logger = createLogger({
  service: {
    name: 'kafka-example',
    version: '1.0.0',
    environment: 'development',
  },
});

// Добавляем транспорт Kafka
logger.addKafkaTransport({
  brokers: ['localhost:9092'], // Измените на адрес вашего Kafka-брокера
  clientId: 'standard-logger',
  topic: 'application-logs',
  batchSize: 10,
  flushIntervalMs: 2000,
  minLogLevel: 'INFO', // Только логи с уровнем INFO и выше
});

console.log('Logger created with Kafka transport');

// Генерируем логи разных уровней
logger.trace('This is a trace message', { source: 'kafka-example' }); // Не будет отправлен в Kafka
logger.debug('This is a debug message', { source: 'kafka-example' }); // Не будет отправлен в Kafka
logger.info('This is an info message', { source: 'kafka-example' }); // Будет отправлен в Kafka
logger.warn('This is a warning message', { source: 'kafka-example' }); // Будет отправлен в Kafka

// Пример с ошибкой
try {
  throw new Error('Test error');
} catch (error) {
  logger.error('An error occurred', error); // Будет отправлен в Kafka
}

// Пример критической ошибки
logger.critical('Critical system failure', {
  // Будет отправлен в Kafka
  component: 'database',
  action: 'write',
  details: 'Connection timeout',
});

console.log('Logs generated, waiting for delivery to Kafka...');

// Добавляем задержку перед закрытием
setTimeout(async () => {
  console.log('Closing logger connections...');
  await logger.close();
  console.log('Logger connections closed. Exiting.');
}, 5000);
