import { client, attachAPI, API_PREFIX } from './client';

export interface EntityAPISchema extends APISchema {
    /** Get entity list */
    getList: {
        request: SearchRequestType & {
            /** Search keyword */
            keyword?: string;
            /** Entity type */
            entity_type?: EntitySchema['type'][];
            /** Entity key */
            entity_keys?: string[];
            /** Entity value type */
            entity_value_type?: EntityValueDataType[];
            /** Entity attributes (read, write, read only) */
            entity_access_mod?: EntityAccessMode[];
            /**
             * Does not contain child nodes (when selecting the trigger service entity, the child entity cannot be delivered directly/when updating the attribute entity, only one child entity cannot be updated)
             */
            exclude_children?: boolean;
            /**
             * Whether to include the entity key
             */
            not_scan_key?: boolean;
            /** Whether it is a custom entity */
            customized?: boolean;
        };
        response: SearchResponseType<EntityData[]>;
    };

    /** Get historical data */
    getHistory: {
        request: SearchRequestType & {
            /** Entity ID */
            entity_id: ApiKey;
            /** Start time stamp, in ms */
            start_timestamp?: number;
            /** End time stamp, in ms */
            end_timestamp?: number;
            page_size?: number;
            page_number?: number;
        };
        response: SearchResponseType<EntityHistoryData[]>;
    };

    /** Get aggregated historical data */
    getAggregateHistory: {
        request: {
            /** Entity ID */
            entity_id: ApiKey;
            /** Start time stamp, in ms */
            start_timestamp: number;
            /** End time stamp, in ms */
            end_timestamp: number;
            /** Aggregation type */
            aggregate_type: DataAggregateType;
        };
        response: {
            /** TODO: To be added, only appears in LAST, MIN, MAX, AVG, and SUM */
            value: number;
            count_result: {
                value: unknown;
                /** quantity */
                count: number;
            }[];
        };
    };

    /** Get metadata */
    getMeta: {
        request: {
            id: ApiKey;
        };
        response: {
            entity_key: ApiKey;
            entity_name: string;
            entity_value_attribute: string;
            entity_value_type: EntityValueDataType;
        };
    };

    /** Gets entity ApiDoc form data */
    getApiDoc: {
        request: {
            entity_id_list: ApiKey[];
        };
        response: unknown;
    };

    /** Update the attribute type entity */
    updateProperty: {
        request: {
            /**
             * Entity key, value
             * */
            exchange: Record<string, any>;
        };
        response: void;
    };

    /** Invoke a service type entity */
    callService: {
        request: {
            /**
             * Entity key, value
             * */
            exchange: Record<string, any>;
        };
        response: void;
    };

    /** Gets the entity's current data */
    getEntityStatus: {
        request: {
            id: ApiKey;
        };
        response: {
            value: any;
            updated_at: number;
            value_type: EntityValueDataType;
        };
    };

    /** fruiting */
    getChildrenEntity: {
        request: {
            id: ApiKey;
        };
        response: unknown;
    };

    /** Delete entity */
    deleteEntities: {
        request: {
            entity_ids: ApiKey[];
        };
        response: unknown;
    };

    /** Edit entity */
    editEntity: {
        request: {
            id: ApiKey;
            name: string;
            value_attribute?: Record<string, any>;
        };
        response: unknown;
    };

    /** Create entity */
    createCustomEntity: {
        request: {
            name: string;
            identifier: string;
            access_mod: EntityAccessMode;
            value_type: EntityValueDataType;
            value_attribute: Record<string, any>;
            type: EntityType;
            unit?: string;
        };
        response: unknown;
    };

    /** Example Export historical entity data */
    exportEntityHistory: {
        request: {
            ids: ApiKey[];
            /** Start time stamp, in ms */
            start_timestamp?: number;
            /** End time stamp, in ms */
            end_timestamp?: number;
        };
        response: unknown;
    };
}

/**
 * Entity related API services
 */
export default attachAPI<EntityAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/entity/search`,
        getHistory: `POST ${API_PREFIX}/entity/history/search`,
        getAggregateHistory: `POST ${API_PREFIX}/entity/history/aggregate`,
        getMeta: `GET ${API_PREFIX}/entity/:id/meta`,
        getApiDoc: `POST ${API_PREFIX}/entity/form`,
        updateProperty: `POST ${API_PREFIX}/entity/property/update`,
        callService: `POST ${API_PREFIX}/entity/service/call`,
        getEntityStatus: `GET ${API_PREFIX}/entity/:id/status`,
        getChildrenEntity: `GET ${API_PREFIX}/entity/:id/children`,
        deleteEntities: `POST ${API_PREFIX}/entity/delete`,
        editEntity: `PUT ${API_PREFIX}/entity/:id`,
        createCustomEntity: `POST ${API_PREFIX}/entity`,
        exportEntityHistory: `GET ${API_PREFIX}/entity/export`,
    },
});
