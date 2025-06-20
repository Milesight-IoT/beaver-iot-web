import { ENTITY_ACCESS_MODE, ENTITY_DATA_VALUE_TYPE, ENTITY_TYPE } from '@/constants';
import { client, attachAPI, API_PREFIX } from './client';

/** template detail */
export interface TemplateType {
    id: string;
    key: string;
    name: string;
    content: string;
    description: string;
    topic: string;
    created_at: string;
}

/** input | output property */
export interface TemplateProperty {
    key: string;
    type: 'string' | 'long' | 'double' | 'boolean';
    entity_mapping?: string;
    required?: boolean;
    enum?: string[];
    properties?: TemplateProperty[];
}

/** entity schema */
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

/** input output schema */
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

export interface MqttBrokerInfoType {
    server: string;
    port: string;
    username: string;
    password: string;
    topic_prefix: string;
}

export interface DataReportResult {
    entities: {
        entity_name: string;
        value: ApiKey;
    }[];
}
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
 * gateway related API services
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
