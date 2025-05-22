import { CompressionTypes } from 'kafkajs';
import { LogLevel } from '../constants/log-levels';

export interface KafkaTransportOptions {
    // Опции подключения к Kafka
    brokers: string[];
    clientId: string;
    topic: string;
    compression?: CompressionTypes;

    // Дополнительные опции
    batchSize?: number;
    flushIntervalMs?: number;
    minLogLevel?: LogLevel;

    // Опции аутентификации (опционально)
    ssl?: boolean;
    sasl?: {
        mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512';
        username: string;
        password: string;
    };
}