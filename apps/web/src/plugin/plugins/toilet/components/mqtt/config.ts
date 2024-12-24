import { MqttConfig } from './typing';

export const mqttConfig: MqttConfig = {
    name: 'broker.emqx.io',
    host: 'ws://broker.emqx.io',
    port: 8083,
    clientId: `mqtt_${Math.random().toString(16).slice(2, 10)}`,
    protocol: 'ws',
    path: '/mqtt',
};

export const MQTT_TOPIC = '/nb/vs330';
