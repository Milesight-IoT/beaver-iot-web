import { client, attachAPI, API_PREFIX } from './client';

export interface SyncModelDetailType {
    input_entities: {
        integration_id: ApiKey;
        name: string;
        identifier: ApiKey;
        access_mod: EntityAccessMode;
        value_type: EntityValueDataType;
        type: EntityType;
        attributes: Partial<EntityValueAttributeType>;
        parent_identifier: ApiKey;
        children: SyncModelDetailType['input_entities'][];
        visible: boolean;
        description: string;
        key: ApiKey;
        parent_key: ApiKey;
        full_identifier: ApiKey;
    }[];
    output: {
        name: string;
        type: string;
        description: string;
        item_schema: Record<string, any>;
    }[];
}

export type InferStatus = 'Ok' | 'Failed';

/**
 * ai integration interface definition
 */
export interface CamthinkAPISchema extends APISchema {
    /** Sync model detail */
    syncModelDetail: {
        request: {
            model_id: ApiKey;
        };
        response: SyncModelDetailType;
    };

    /** Get devices */
    getDevices: {
        request: void | {
            /** Search keyword */
            name?: string;

            /** Whether to search for bound devices */
            is_bound?: boolean;
        };
        response: {
            content: {
                id: ApiKey;
                identifier: string;
                name: string;
                integration_id: ApiKey;
                integration_name: string;
                bound: boolean;
            }[];
        };
    };

    /** Get image entities of device */
    getDeviceImageEntities: {
        request: {
            /** Device ID */
            id: ApiKey;
        };
        response: {
            content: {
                id: ApiKey;
                key: string;
                name: string;
                format: 'IMAGE:URL' | 'IMAGE:BASE64';
                /** url or base64 string */
                value?: string;
            }[];
        };
    };

    /** Bind device */
    bindDevice: {
        request: {
            /** Device ID */
            id: ApiKey;
            model_id: ApiKey;
            /** Image entity key */
            image_entity_key: ApiKey;
            /** The AI model inference input */
            infer_inputs: Record<string, any>;
            /** The AI model inference output definition */
            infer_outputs: {
                field_name: string;
                entity_name: string;
            }[];
        };
        response: void;
    };

    /** Get bound devices */
    getBoundDevices: {
        request: {
            /** Search keyword */
            name?: string;
            page_size: number;
            page_number: number;
        };
        response: {
            page_size: number;
            page_number: number;
            total: number;
            content: {
                device_id: ApiKey;
                device_name: string;
                /** Inference Model Name */
                model_name?: string;
                /** Current Bind Model Name */
                current_model_name: string;
                origin_image: string;
                result_image: string;
                /** JSON string */
                infer_outputs_data: string;
                infer_status: InferStatus;
                uplink_at?: number;
                infer_at?: number;
                create_at: number;
                infer_history_entity_id: ApiKey;
                infer_history_entity_key: string;
            }[];
        };
    };

    /** Get binding detail */
    getBindingDetail: {
        request: {
            id: ApiKey;
        };
        response: Omit<CamthinkAPISchema['bindDevice']['request'], 'id'> & {
            integration_id: ApiKey;
            image_entity_value: string;
            device_identifier: string;
        };
    };

    /** Unbind device */
    unbindDevices: {
        request: {
            device_ids: ApiKey[];
        };
        response: void;
    };
}

/**
 * ai integration API services
 */
export default attachAPI<CamthinkAPISchema>(client, {
    apis: {
        syncModelDetail: `POST ${API_PREFIX}/camthink-ai-inference/model/:model_id/sync-detail`,
        getDevices: `POST ${API_PREFIX}/camthink-ai-inference/device/search`,
        getDeviceImageEntities: `GET ${API_PREFIX}/camthink-ai-inference/device/:id/image-entities`,
        bindDevice: `POST ${API_PREFIX}/camthink-ai-inference/device/:id/bind`,
        getBoundDevices: `POST ${API_PREFIX}/camthink-ai-inference/bound-device/search`,
        getBindingDetail: `GET ${API_PREFIX}/camthink-ai-inference/device/:id/binding-detail`,
        unbindDevices: `POST ${API_PREFIX}/camthink-ai-inference/device/unbind`,
    },
});
