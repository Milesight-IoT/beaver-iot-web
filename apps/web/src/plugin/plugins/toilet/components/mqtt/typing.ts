export interface MqttConfig {
    name: string;
    host: string;
    port: number;
    clientId: string;
    protocol: string;
    path: string;
}

export interface MqttMessage {
    OCCUPANCY: number;
    distance: number;
    pir: number;
    sensor: string;
    tof_status: number;
}
