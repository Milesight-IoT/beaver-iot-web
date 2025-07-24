import { client, attachAPI, API_PREFIX } from './client';

type IntegrationDetailType = {
    /** ID  */
    id: ApiKey;
    /** icon */
    icon?: string;
    /** name */
    name: string;
    /** Description */
    description?: string;
    /**
     * Add a device form entity Key
     *
     * Note: The entity key identified in this field is only used to add devices
     */
    add_device_service_key: ApiKey;

    /**
     * Delete the device form entity Key
     *
     * Note: The entity key identified in this field is only used to delete the device
     */
    delete_device_service_key: ApiKey;
    /** Number of equipment */
    device_count: number;
    /** Number of entities */
    entity_count: number;
};

export interface IntegrationAPISchema extends APISchema {
    /** Get integration list */
    getList: {
        request: void | {
            /** Whether devices can be added */
            device_addable?: boolean;
            /** Whether the device can be deleted */
            device_deletable?: boolean;
        };
        response: IntegrationDetailType[];
    };

    /** Get integration details */
    getDetail: {
        request: {
            /** Integration ID */
            id: ApiKey;
        };
        response: IntegrationDetailType & {
            integration_entities: {
                /** Entity ID */
                id: ApiKey;
                /** Physical Key */
                key: ApiKey;
                /** Entity name */
                name: string;
                /** Entity type */
                type: EntityType;
                /** ID of the entity parent */
                parent?: ApiKey;
                /** Access mode */
                access_mod?: EntityAccessMode;
                /** Entity attribute */
                value_attribute: Partial<EntityValueAttributeType>;
                /** Entity value */
                value?: string;
                /** Entity value type */
                value_type: EntityValueDataType;
                /** Entity description */
                description?: string;
            }[];
        };
    };
}

/**
 * Integrate related API services
 */
export default attachAPI<IntegrationAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/integration/search`,
        getDetail: `GET ${API_PREFIX}/integration/:id`,
    },
});
