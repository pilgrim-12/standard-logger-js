import { Kafka, Producer, CompressionTypes, Message, SASLOptions } from 'kafkajs';
import { LogEntry } from '../interfaces/log-entry';
import { KafkaTransportOptions } from '../interfaces/kafka-options';
import { LogLevel } from '../constants/log-levels';

/**
 * Transport for sending logs to Apache Kafka
 */
export class KafkaTransport {
    private producer: Producer;
    private topic: string;
    private compression: CompressionTypes;
    private batchSize: number;
    private flushIntervalMs: number;
    private minLogLevel: LogLevel;
    private messageQueue: Message[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private connected: boolean = false;
    private connecting: boolean = false;
    private logLevelValue: Record<LogLevel, number> = {
        [LogLevel.TRACE]: 10,
        [LogLevel.DEBUG]: 20,
        [LogLevel.INFO]: 30,
        [LogLevel.WARN]: 40,
        [LogLevel.ERROR]: 50,
        [LogLevel.CRITICAL]: 60
    };

    /**
     * Creates a new Kafka transport instance
     * @param options Kafka transport options
     */
    constructor(options: KafkaTransportOptions) {
        const kafka = new Kafka({
            clientId: options.clientId,
            brokers: options.brokers,
            ssl: options.ssl,
            sasl: options.sasl as SASLOptions
        });

        this.producer = kafka.producer();
        this.topic = options.topic;
        this.compression = options.compression || CompressionTypes.None;
        this.batchSize = options.batchSize || 100;
        this.flushIntervalMs = options.flushIntervalMs || 5000;
        this.minLogLevel = options.minLogLevel || LogLevel.TRACE;
    }

    /**
     * Initializes the Kafka transport by connecting to brokers
     */
    async init(): Promise<void> {
        if (this.connected || this.connecting) return;

        this.connecting = true;
        try {
            await this.producer.connect();
            this.connected = true;
            this.startFlushTimer();
        } catch (error) {
            console.error('Failed to connect to Kafka:', error);
        } finally {
            this.connecting = false;
        }
    }

    /**
     * Checks if the log level meets the minimum threshold
     * @param level Log level to check
     * @returns True if the log should be sent
     */
    private shouldLog(level: LogLevel): boolean {
        return this.logLevelValue[level] >= this.logLevelValue[this.minLogLevel];
    }

    /**
     * Sends a log entry to Kafka
     * @param entry Log entry to send
     */
    async log(entry: LogEntry): Promise<void> {
        if (!this.shouldLog(entry.level as LogLevel)) return;

        if (!this.connected) {
            await this.init();
        }

        const message: Message = {
            value: JSON.stringify(entry)
        };

        this.messageQueue.push(message);

        if (this.messageQueue.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * Starts a timer to periodically flush queued messages
     */
    private startFlushTimer(): void {
        if (this.flushTimer) return;

        this.flushTimer = setInterval(async () => {
            if (this.messageQueue.length > 0) {
                await this.flush();
            }
        }, this.flushIntervalMs);

        // Ensure the timer doesn't keep the process alive
        if (this.flushTimer.unref) {
            this.flushTimer.unref();
        }
    }

    /**
     * Flushes queued messages to Kafka
     */
    private async flush(): Promise<void> {
        if (!this.connected || this.messageQueue.length === 0) return;

        const messages = [...this.messageQueue];
        this.messageQueue = [];

        try {
            await this.producer.send({
                topic: this.topic,
                compression: this.compression,
                messages
            });
        } catch (error) {
            console.error('Failed to send messages to Kafka:', error);
            // Put messages back in the queue
            this.messageQueue = [...messages, ...this.messageQueue];
        }
    }

    /**
     * Closes the Kafka connection and flushes remaining messages
     */
    async close(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        if (this.messageQueue.length > 0) {
            await this.flush();
        }

        if (this.connected) {
            await this.producer.disconnect();
            this.connected = false;
        }
    }
}