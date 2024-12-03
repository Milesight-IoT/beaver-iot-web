import { client, attachAPI, API_PREFIX } from './client';

type IntegrationDetailType = {
    /** ID */
    id: ApiKey;
    /** 图标 */
    icon?: string;
    /** 名称 */
    name: string;
    /** 描述 */
    description?: string;
    /**
     * 添加设备表单实体 Key
     *
     * 说明：该字段标识的实体 key 仅用于添加设备
     */
    add_device_service_key: ApiKey;

    /**
     * 删除设备表单实体 Key
     *
     * 说明：该字段标识的实体 key 仅用于删除设备
     */
    delete_device_service_key: ApiKey;
    /** 设备数量 */
    device_count: number;
    /** 实体数量 */
    entity_count: number;
};

export interface IntegrationAPISchema extends APISchema {
    /** 获取集成列表 */
    getList: {
        request: void | {
            /** 是否能添加设备 */
            device_addable?: boolean;
            /** 是否能删除设备 */
            device_deletable?: boolean;
        };
        response: IntegrationDetailType[];
    };

    /** 获取集成详情 */
    getDetail: {
        request: {
            /** 集成 ID */
            id: ApiKey;
        };
        response: IntegrationDetailType & {
            integration_entities: {
                /** 实体 ID */
                id: ApiKey;
                /** 实体 Key */
                key: ApiKey;
                /** 实体名称 */
                name: string;
                /** 实体类型 */
                type: EntityType;
                /** 实体父级 ID */
                parent?: ApiKey;
                /** 访问模式 */
                access_mod?: EntityAccessMode;
                /** 实体属性 */
                value_attribute: Partial<EntityValueAttributeType>;
                /** 实体值 */
                value: string;
                /** 实体值类型 */
                value_type: EntityValueDataType;
            }[];
        };
    };
}

/**
 * 集成相关 API 服务
 */
export default attachAPI<IntegrationAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/integration/search`,
        getDetail: `GET ${API_PREFIX}/integration/:id`,
    },
});
