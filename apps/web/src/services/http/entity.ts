import { client, attachAPI, API_PREFIX } from './client';

export interface EntityAPISchema extends APISchema {
    /** 获取实体列表 */
    getList: {
        request: SearchRequestType & {
            /** 搜索关键字 */
            keyword?: string;
            /** 实体类型 */
            entity_type?: EntitySchema['type'][];
            /** 实体值类型 */
            entity_value_type?: EntityValueDataType[];
            /** 实体属性（可读、可写、只读） */
            entity_access_mod?: EntityAccessMode[];
            /**
             * 不包含子节点(在选择触发服务实体的时候，不能直接下发子实体/在更新属性实体时，不能只更新某个子实体)
             */
            exclude_children?: boolean;
            /** 是否是自定义实体 */
            customized?: boolean;
        };
        response: SearchResponseType<EntityData[]>;
    };

    /** 获取历史数据 */
    getHistory: {
        request: SearchRequestType & {
            /** 实体 ID */
            entity_id: ApiKey;
            /** 开始时间戳，单位 ms */
            start_timestamp?: number;
            /** 结束时间戳，单位 ms */
            end_timestamp?: number;
            page_size?: number;
            page_number?: number;
        };
        response: SearchResponseType<EntityHistoryData[]>;
    };

    /** 获取聚合历史数据 */
    getAggregateHistory: {
        request: {
            /** 实体 ID */
            entity_id: ApiKey;
            /** 开始时间戳，单位 ms */
            start_timestamp: number;
            /** 结束时间戳，单位 ms */
            end_timestamp: number;
            /** 聚合类型 */
            aggregate_type: DataAggregateType;
        };
        response: {
            /** TODO: 待补充，只有在 LAST, MIN, MAX, AVG, SUM 出现 */
            value: number;
            count_result: {
                value: unknown;
                /** 数量 */
                count: number;
            }[];
        };
    };

    /** 获取元数据 */
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

    /** 获取实体 ApiDoc 表单数据 */
    getApiDoc: {
        request: {
            entity_id_list: ApiKey[];
        };
        response: unknown;
    };

    /** 更新属性类型实体 */
    updateProperty: {
        request: {
            /**
             * 实体 key, value
             * */
            exchange: Record<string, any>;
        };
        response: void;
    };

    /** 调用服务类型实体 */
    callService: {
        request: {
            /**
             * 实体 key, value
             * */
            exchange: Record<string, any>;
        };
        response: void;
    };

    /** 获取实体当前数据 */
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

    /** 获取子实体 */
    getChildrenEntity: {
        request: {
            id: ApiKey;
        };
        response: unknown;
    };

    /** 删除实体 */
    deleteEntities: {
        request: {
            entity_ids: ApiKey[];
        };
        response: unknown;
    };

    /** 编辑实体 */
    editEntity: {
        request: {
            id: ApiKey;
            name: string;
        };
        response: unknown;
    };

    /** 创建实体 */
    createCustomEntity: {
        request: {
            name: string;
            access_mod: EntityAccessMode;
            value_type: EntityValueDataType;
            value_attribute: Record<string, any>;
            type: EntityType;
        };
        response: unknown;
    };

    /** 导出实体历史数据 */
    exportEntityHistory: {
        request: {
            ids: ApiKey[];
            /** 开始时间戳，单位 ms */
            start_timestamp?: number;
            /** 结束时间戳，单位 ms */
            end_timestamp?: number;
        };
        response: unknown;
    };
}

/**
 * 实体相关 API 服务
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
