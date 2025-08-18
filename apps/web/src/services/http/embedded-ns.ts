import { client, attachAPI, API_PREFIX } from './client';

/** gateway detail */
export interface GatewayDetailType {
    device_id: string;
    device_key: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE';
    credential_id: string;
    device_count: number;
    application_id: string;
    eui: string;
}

/** synced device detail */
export interface SyncedDeviceType {
    id: string;
    ke?: string;
    eui: string;
    name: string;
    created_at: string;
}

/** syncAble device detail */
export type SyncAbleDeviceType = {
    eui: string;
    name: string;
    guess_model_id?: string;
};

/** mqtt credential detail */
export interface MqttCredentialResponse {
    credential_id?: string;
    username?: string;
    password?: string;
    client_id?: string;
    uplink_data_topic?: string;
    downlink_data_topic?: string;
    request_data_topic?: string;
    response_data_topic?: string;
}

/** mqtt broker detail */
export interface MqttBrokerInfo {
    host?: string;
    mqtt_port?: number;
    mqtts_port?: number;
    ws_ath?: string;
    ws_port?: number;
    wss_port?: number;
}

/** mqtt credential and broker detail */
export type MqttCredentialBrokerType = MqttCredentialResponse & MqttBrokerInfo;

/** mqtt check connect result */
export interface MqttConnectionValidateResponse {
    app_result: DeviceListAppItem[];
    profile_result: DeviceListProfileItem[];
}

/** mqtt check connect result  applications */
export interface DeviceListAppItem {
    app_name: string;
    application_id: string;
}

/** model select options */
export interface DeviceModelItem {
    label: string;
    value: string;
}

/** model response type */
type DeviceModelResponse = {
    [key: string]: string;
};

/** ProfileType */
interface DeviceListProfileItem {
    profile_id: string;
    profile_name: string;
    supports_join: boolean;
}

export interface GatewayAPISchema extends APISchema {
    /** Get gateway list */
    getList: {
        request: void;
        response: {
            gateways: GatewayDetailType[];
        };
    };
    /** delete gateway */
    deleteGateWay: {
        request: {
            gateways: ApiKey[];
        };
        response: void;
    };

    /** add gateway */
    addGateway: {
        request: {
            name: string | undefined;
            eui: string | undefined;
            application_id: string;
            credential_id: string | undefined;
            client_id: string | undefined;
        };
        response: unknown;
    };

    /** get synced subDevice */
    getSyncedDevices: {
        request: {
            eui: string;
        };
        response: SyncedDeviceType[];
    };

    /** get sync able subsDevice */
    getSyncAbleDevices: {
        request: {
            eui: string;
        };
        response: SyncAbleDeviceType[];
    };

    /** sync devices */
    syncDevices: {
        request: {
            eui: string;
            devices: {
                eui: string;
                model_id: string;
            }[];
        };
        response: unknown;
    };

    /** get credential info */
    getCredential: {
        request: {
            eui: string;
            credential_id?: string;
        };
        response: MqttCredentialResponse;
    };
    /** get mqtt broke info */
    getMqttBrokerInfo: {
        request: void;
        response: MqttBrokerInfo;
    };
    /** check mqtt connection */
    checkMqttConnection: {
        request: {
            eui: string;
            credential_id?: string;
        };
        response: MqttConnectionValidateResponse;
    };
    validateGateway: {
        request: {
            eui: string;
        };
        response: void;
    };
    /** get device-model */
    getDeviceModels: {
        request: void;
        response: DeviceModelResponse;
    };
}

/**
 * gateway related API services
 */
export default attachAPI<GatewayAPISchema>(client, {
    apis: {
        getList: `GET ${API_PREFIX}/milesight-gateway/gateways`,
        deleteGateWay: `POST ${API_PREFIX}/milesight-gateway/batch-delete-gateways`,
        addGateway: `POST ${API_PREFIX}/milesight-gateway/gateways`,
        async getSyncedDevices(params, options) {
            return client.request({
                method: 'GET',
                url: `${API_PREFIX}/milesight-gateway/gateways/${params.eui}/devices`,
                data: params,
                ...options,
            });
        },
        async getSyncAbleDevices(params, options) {
            return client.request({
                method: 'GET',
                url: `${API_PREFIX}/milesight-gateway/gateways/${params.eui}/sync-devices`,
                ...params,
                ...options,
            });
        },
        syncDevices: `POST ${API_PREFIX}/milesight-gateway/gateways/:eui/sync-devices`,
        getCredential: `POST ${API_PREFIX}/milesight-gateway/gateway-credential`,
        getMqttBrokerInfo: `GET ${API_PREFIX}/mqtt/broker-info`,
        checkMqttConnection: `POST ${API_PREFIX}/milesight-gateway/validate-connection`,
        validateGateway: `POST ${API_PREFIX}/milesight-gateway/validate-gateway-info`,
        getDeviceModels: `GET ${API_PREFIX}/milesight-gateway/device-models`,
    },
});
