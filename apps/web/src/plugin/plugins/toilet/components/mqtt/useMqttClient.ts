/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import mqtt, { MqttClient as MqttClientType, MqttProtocol } from 'mqtt';
import { MqttConfig, MqttMessage } from './typing';
import { MQTT_TOPIC, mqttConfig } from './config';

interface UseMqttClientProps {
    config?: MqttConfig;
    topic?: string;
    onMessage?: (message: MqttMessage) => void;
}

export function useMqttClient({
    config = mqttConfig,
    topic = MQTT_TOPIC,
    onMessage,
}: UseMqttClientProps = {}) {
    const [client, setClient] = useState<MqttClientType | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [message, setMessage] = useState<MqttMessage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mqttClient: MqttClientType;

        try {
            const url = `${config.host}:${config.port}${config.path}`;

            mqttClient = mqtt.connect(url, {
                clientId: config.clientId,
                clean: true,
                protocol: config.protocol as MqttProtocol,
                reconnectPeriod: 5000,
                keepalive: 60,
                connectTimeout: 4000,
                rejectUnauthorized: false,
                will: {
                    topic,
                    payload: JSON.stringify({ status: 'offline' }),
                    qos: 1,
                    retain: false,
                },
            });

            mqttClient.on('connect', () => {
                console.log('Connected to MQTT broker');
                setIsConnected(true);
                setError(null);

                mqttClient.subscribe(topic, err => {
                    if (!err) {
                        console.log(`Subscribed to ${topic}`);
                    } else {
                        setError(`Subscribe error: ${err.message}`);
                    }
                });
            });

            mqttClient.on('message', (_topic: string, payload: Buffer) => {
                try {
                    const parsedMessage: MqttMessage = JSON.parse(payload.toString());
                    setMessage(parsedMessage);
                    onMessage?.(parsedMessage);
                    console.log('Received message:', parsedMessage);
                } catch (e) {
                    const error = e as Error;
                    setError(`Error parsing message: ${error.message}`);
                    console.error('Error parsing message:', error);
                }
            });

            mqttClient.on('error', (err: Error) => {
                console.error('MQTT Error:', err);
                setError(`MQTT Error: ${err.message}`);
                setIsConnected(false);
            });

            mqttClient.on('close', () => {
                console.log('MQTT connection closed');
                setIsConnected(false);
            });

            setClient(mqttClient);
        } catch (e) {
            const error = e as Error;
            setError(`Connection error: ${error.message}`);
            console.error('Connection error:', error);
        }

        return () => {
            if (mqttClient) {
                mqttClient.end();
            }
        };
    }, [config, topic, onMessage]);

    const reconnect = () => {
        if (client) {
            client.end();
            setClient(null);
            setIsConnected(false);
            setError(null);
        }
    };

    return {
        client,
        isConnected,
        message,
        error,
        reconnect,
    };
}
