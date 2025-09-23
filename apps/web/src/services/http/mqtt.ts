import { ENTITY_ACCESS_MODE, ENTITY_DATA_VALUE_TYPE, ENTITY_TYPE } from '@/constants';
import { client, attachAPI, API_PREFIX } from './client';

/** List template  */
export interface TemplateType {
    id: string;
    key: string;
    name: string;
    content: string;
    description: string;
    topic: string;
    device_count?: number;
    created_at: number;
    updated_at: number;
    device_offline_timeout: number;
}

/** Input | Output property */
export interface TemplateProperty {
    key: string;
    type: 'string' | 'long' | 'double' | 'boolean';
    entity_mapping?: string;
    required?: boolean;
    enum?: string[];
    properties?: TemplateProperty[];
}

/** Entity schema */
export interface EntitySchemaType {
    device_key: string;
    name: string;
    access_mod: ENTITY_ACCESS_MODE;
    value_type: ENTITY_DATA_VALUE_TYPE;
    type: ENTITY_TYPE;
    attributes: Record<string, any>;
    identifier: string;
    integration_id: string;
    children: EntitySchemaType[];
    visible: true;
    key: string;
    full_identifier: string;
}

/** Template detail */
export interface TemplateDetailType extends Omit<TemplateType, 'device_count'> {
    integration: string;
    input_schema: {
        type: object;
        properties: TemplateProperty[];
    };
    output_schema: {
        type: object;
        properties: TemplateProperty[];
    };
    entity_schema: EntitySchemaType[];
}

/** Mqtt broker info */
export interface MqttBrokerInfoType {
    server: string;
    port: string;
    username: string;
    password: string;
    topic_prefix: string;
}

/** Data report result */
export interface DataReportResult {
    entities: {
        entity_name: string;
        value: ApiKey;
    }[];
}

/** Mqtt device integration API */
export interface MqttDeviceAPISchema extends APISchema {
    /** Get mqtt broker */
    getBrokerInfo: {
        request: void;
        response: MqttBrokerInfoType;
    };
    /** Get default */
    getDefaultTemplate: {
        request: void;
        response: {
            content: string;
        };
    };
    getList: {
        request: SearchRequestType & {
            /** Search keyword */
            name?: string;
        };
        response: SearchResponseType<TemplateType[]>;
    };
    getTemplateDetail: {
        request: {
            id: ApiKey;
        };
        response: TemplateDetailType;
    };
    /** add template */
    addTemplate: {
        request: {
            name: string;
            topic: string;
            content: string;
            description: string;
            device_offline_timeout: number;
        };
        response: void;
    };
    /** check template */
    checkTemplate: {
        request: {
            content: string;
        };
        response: void;
    };
    /** update template */
    updateTemplate: {
        request: {
            name: string;
            topic: string;
            content: string;
            description: string;
            device_offline_timeout: number;
        };
        response: void;
    };
    /** test data template */
    testTemplate: {
        request: {
            id: ApiKey;
            test_data: string;
        };
        response: DataReportResult;
    };
    /** delete template */
    deleteTemplate: {
        request: {
            id_list: ApiKey[];
        };
        response: void;
    };
}

/**
 * Default device offline timeout in minutes
 */
export const DEFAULT_DEVICE_OFFLINE_TIMEOUT = 1500;

/**
 *  Mqtt device integration related API services
 */
export default attachAPI<MqttDeviceAPISchema>(client, {
    apis: {
        getBrokerInfo: `GET ${API_PREFIX}/mqtt-device/broker-info`,
        getDefaultTemplate: `GET ${API_PREFIX}/mqtt-device/device-template/default`,
        getList: `POST ${API_PREFIX}/mqtt-device/device-template/search`,
        getTemplateDetail: `GET ${API_PREFIX}/mqtt-device/device-template/:id`,
        addTemplate: `POST ${API_PREFIX}/mqtt-device/device-template`,
        checkTemplate: `POST ${API_PREFIX}/mqtt-device/device-template/validate`,
        updateTemplate: `PUT ${API_PREFIX}/mqtt-device/device-template/:id`,
        testTemplate: `POST ${API_PREFIX}/mqtt-device/device-template/:id/test`,
        deleteTemplate: `POST ${API_PREFIX}/mqtt-device/device-template/batch-delete`,
    },
});
