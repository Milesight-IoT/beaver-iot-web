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
    /** User Email */
    user_email: string;
    /** User Nickname */
    user_nickname: string;
    /** Additional data (usually used by the back end, the front end is not open for now) */
    // additional_data?: Record<string, any>;
    /** device group name */
    group_name?: string;
    /** device group id */
    group_id?: ApiKey;
}

/**
 * Device group Item
 */
export interface DeviceGroupItemProps {
    id: ApiKey;
    name: string;
    device_count?: number;
}

export interface AddDeviceProps {
    /** Integration ID */
    integration: ApiKey;
    /** name */
    name?: string;
    /** device group name */
    group_name?: string;
    /** Integrate additional information needed for new devices */
    param_entities: Record<string, any>;
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
            /** Device template key */
            template?: string;
            /** Search device by the group */
            group_id?: ApiKey;
            /** Get not grouped */
            filter_not_grouped?: boolean;
            /** External id of the device */
            identifier?: string;
        };
        response: SearchResponseType<DeviceDetail[]>;
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
                /** Entity tags */
                entity_tags?: {
                    id: ApiKey;
                    name: string;
                    description?: string;
                    color: string;
                }[];
            }[];
        };
    };

    /** Add device */
    addDevice: {
        request: AddDeviceProps;
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

    /** Get device group search list */
    getDeviceGroupList: {
        request: SearchRequestType & {
            /** Name (Fuzzy search) */
            name?: string;
            /** is the count of devices required ? */
            with_device_count?: boolean;
        };
        response: SearchResponseType<DeviceGroupItemProps[]>;
    };
    /** Add device group */
    addDeviceGroup: {
        request: {
            name: string;
        };
        response: void;
    };
    /** Update device group */
    updateDeviceGroup: {
        request: {
            id: ApiKey;
            name: string;
        };
        response: void;
    };
    /** Delete device group */
    deleteDeviceGroup: {
        request: {
            id: ApiKey;
        };
        response: void;
    };
    /** Get device-group count */
    getDeviceGroupCount: {
        request: void;
        response: {
            number: number;
        };
    };
    /** Device move to group */
    moveDeviceToGroup: {
        request: {
            group_id?: ApiKey;
            device_id_list: ApiKey[];
        };
        response: void;
    };
    /** Get device batch add template file */
    getDeviceBatchTemplate: {
        request: {
            integration: string;
        };
        response: Blob;
    };
    /** Parse device batch template file */
    parseDeviceBatchTemplate: {
        request: {
            integration: ApiKey;
            file: File;
        };
        response: {
            create_device_requests: AddDeviceProps[];
            row_id: ApiKey[];
        };
    };
    /** Generate error file */
    generateDeviceAddErrorFile: {
        request: {
            integration: string;
            file: File;
            errors: string;
        };
        response: Blob;
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
        getDeviceGroupList: `POST ${API_PREFIX}/device-group/search`,
        addDeviceGroup: `POST ${API_PREFIX}/device-group`,
        updateDeviceGroup: `PUT ${API_PREFIX}/device-group/:id`,
        deleteDeviceGroup: `DELETE ${API_PREFIX}/device-group/:id`,
        getDeviceGroupCount: `GET ${API_PREFIX}/device-group/number`,
        moveDeviceToGroup: `POST ${API_PREFIX}/device/move-to-group`,
        getDeviceBatchTemplate: `POST ${API_PREFIX}/device-batch/template`,
        parseDeviceBatchTemplate: {
            method: 'POST',
            path: `${API_PREFIX}/device-batch/parse`,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
        generateDeviceAddErrorFile: {
            method: 'POST',
            path: `${API_PREFIX}/device-batch/fill-error`,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    },
});
