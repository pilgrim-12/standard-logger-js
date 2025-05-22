import pino from 'pino';
import { KafkaTransport } from '../transports/kafka-transport';
import { KafkaTransportOptions } from '../interfaces/kafka-options';
import { LogEntry } from '../interfaces/log-entry';

/**
 * Creates a Pino transport that sends logs to Kafka
 * @param kafkaOptions Kafka transport options
 * @returns Pino transport configuration
 */
export function createKafkaPinoTransport(kafkaOptions: KafkaTransportOptions): {
    transport: pino.TransportSingleOptions
} {
    const kafkaTransport = new KafkaTransport(kafkaOptions);

    // Initialize Kafka connection
    kafkaTransport.init().catch(err => {
        console.error('Failed to initialize Kafka transport:', err);
    });

    // Handle process exit to close Kafka connections
    process.on('beforeExit', async () => {
        await kafkaTransport.close();
    });

    // Create a custom destination
    const destination = {
        write: (data: string) => {
            try {
                const logEntry: LogEntry = JSON.parse(data);
                kafkaTransport.log(logEntry).catch(err => {
                    console.error('Error writing to Kafka transport:', err);
                });
            } catch (err) {
                console.error('Error parsing log data:', err);
            }
        }
    };

    // Create a transport factory for Pino
    return {
        transport: {
            target: 'pino/file',
            options: {
                destination
            }
        }
    };
}