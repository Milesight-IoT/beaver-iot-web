import { client, attachAPI, API_PREFIX } from './client';

/**
 * Device detail definition
 */
export interface DeviceDetail {
    /** ID */
    id: ApiKey;
    /** Key */
    key: ApiKey;
    /** name */
    name: string;
    /** Device identification */
    identifier: ApiKey;
    /** Integration ID */
    integration: ApiKey;
    /** Integrated name */
    integration_name: string;
    /** Creation time */
    created_at: number;
    /** Update time */
    updated_at: number;
    /** Whether it can be deleted */
    deletable: boolean;
    /** Additional data (usually used by the back end, the front end is not open for now) */
    // additional_data?: Record<string, any>;
}

/**
 * Device related interface definition
 */
export interface DeviceAPISchema extends APISchema {
    /** Get device list */
    getList: {
        request: SearchRequestType & {
            /** Name (Fuzzy search) */
            name?: string;
        };
        response: SearchResponseType<Omit<DeviceDetail, 'identifier'>[]>;
    };

    /** Get Device Details */
    getDetail: {
        request: {
            id: ApiKey;
        };
        response: DeviceDetail & {
            entities: {
                id: ApiKey;
                key: ApiKey;
                name: string;
                type: EntityType;
                value_attribute: Partial<EntityValueAttributeType>;
                value_type: EntityValueDataType;
            }[];
        };
    };

    /** Add device */
    addDevice: {
        request: {
            /** name */
            name?: string;
            /** Integration ID */
            integration: ApiKey;
            /** Integrate additional information needed for new devices */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };

    /** Delete device */
    deleteDevices: {
        request: {
            device_id_list: ApiKey[];
        };
        response: unknown;
    };

    /** Replacement equipment */
    updateDevice: {
        request: {
            id: ApiKey;
            /** name */
            name: string;
        };
        response: unknown;
    };
}

/**
 * Device-related API services
 */
export default attachAPI<DeviceAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/device/search`,
        getDetail: `GET ${API_PREFIX}/device/:id`,
        addDevice: `POST ${API_PREFIX}/device`,
        deleteDevices: `POST ${API_PREFIX}/device/batch-delete`,
        updateDevice: `PUT ${API_PREFIX}/device/:id`,
    },
});
