import { client, attachAPI, API_PREFIX } from './client';

/**
 * 插件详情定义
 */
export interface ParserDetail {
    /** ID */
    id: ApiKey;
    /** model */
    model: string;
    /** 类型 */
    type: string;
    /** 输入 */
    input: string;
    /** 额外数据（通常为后端使用，前端暂不开放） */
    // additional_data?: Record<string, any>;
}

/**
 * 插件相关接口定义
 */
export interface ParserAPISchema extends APISchema {

    /** 解析 */
    parser: {
        request: {
            /** model */
            model?: string;
            /** 类型 */
            type?: string;
            /** 输入 */
            input?: string;
            /** 集成 ID */
            integration: ApiKey;
            /** 集成新增插件需要的额外信息 */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };

}

/**
 * 插件相关 API 服务
 */
export default attachAPI<ParserAPISchema>(client, {
    apis: {
        parser: `POST ${API_PREFIX}/parser`,
    },
});
