import React from 'react';
import { MqttConfig, MqttMessage } from './typing';
import { MQTT_TOPIC, mqttConfig } from './config';
import { useMqttClient } from './useMqttClient';

interface MqttClientProps {
    config?: MqttConfig;
    topic?: string;
    onMessage?: (message: MqttMessage) => void;
}

const MqttClient: React.FC<MqttClientProps> = ({
    config = mqttConfig,
    topic = MQTT_TOPIC,
    onMessage,
}) => {
    const { isConnected, message, error, reconnect } = useMqttClient({
        config,
        topic,
        onMessage,
    });

    return (
        <div className="mqtt-client">
            <h2 className="mqtt-client__title">MQTT Client Status</h2>
            <div className="mqtt-client__status">
                <p>
                    Connection Status:
                    <span
                        className={`status-indicator${isConnected ? 'connected' : 'disconnected'}`}
                    >
                        {' '}
                        {isConnected ? 'Connected' : 'Disconnected'}{' '}
                    </span>{' '}
                </p>{' '}
                {error && (
                    <div className="mqtt-client__error">
                        {' '}
                        Error: {error} {/* eslint-disable-next-line react/button-has-type */}{' '}
                        <button onClick={reconnect}>Reconnect</button>{' '}
                    </div>
                )}{' '}
            </div>{' '}
            {message && (
                <div className="mqtt-client__message">
                    {' '}
                    <h3>Latest Message:</h3>
                    <pre>{JSON.stringify(message, null, 2)}</pre>
                    <div className="mqtt-client__message-details">
                        <p>Occupancy: {message.OCCUPANCY}</p>
                        <p>Distance: {message.distance}</p>
                        <p>PIR: {message.pir}</p>
                        <p>Sensor: {message.sensor}</p>
                        <p>TOF Status: {message.tof_status}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MqttClient;
