import { client, attachAPI, API_PREFIX } from './client';

/**
 * 插件详情定义
 */
export interface PluginDetail {
    /** ID */
    id: ApiKey;
    /** Key */
    key: ApiKey;
    /** 名称 */
    name: string;
    /** 插件标识 */
    identifier: ApiKey;
    /** 集成 ID */
    integration: ApiKey;
    /** 集成名称 */
    integration_name: string;
    /** 创建时间 */
    created_at: number;
    /** 更新时间 */
    updated_at: number;
    /** 是否可删除 */
    deletable: boolean;
    /** 额外数据（通常为后端使用，前端暂不开放） */
    // additional_data?: Record<string, any>;
}

/**
 * 插件相关接口定义
 */
export interface PluginAPISchema extends APISchema {
    /** 获取插件列表 */

    getPluginList: {
        request: SearchRequestType & {
            /** 名称（模糊搜索） */
            name?: string;
        };
        response: SearchResponseType<Omit<PluginDetail, 'identifier'>[]>;
    };

   

    /** 添加插件 */
    addPlugin: {
        request: {
            /** 名称 */
            name?: string;
            /** 插件包 */
            text: string;
            /** 集成新增插件需要的额外信息 */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };

    /** 删除插件 */
    deletePlugins: {
        request: {
            plugin_id_list: ApiKey[];
        };
        response: unknown;
    };
}

/**
 * 插件相关 API 服务
 */
export default attachAPI<PluginAPISchema>(client, {
    apis: {
        getPluginList: `POST ${API_PREFIX}/plugin/search`,
        addPlugin: `POST ${API_PREFIX}/plugin`,
        deletePlugins: `POST ${API_PREFIX}/plugin/batch-delete`,
    },
});
