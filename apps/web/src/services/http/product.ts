import { client, attachAPI, API_PREFIX } from './client';

/**
 * 产品详情定义
 */
export interface ProductDetail {
    /** ID */
    id: ApiKey;
    /** Key */
    key: ApiKey;
    /** 名称 */
    name: string;
    /** 产品标识 */
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
 * 产品相关接口定义
 */
export interface ProductAPISchema extends APISchema {
    /** 获取产品列表 */

    getProductList: {
        request: SearchRequestType & {
            /** 名称（模糊搜索） */
            name?: string;
        };
        response: SearchResponseType<Omit<ProductDetail, 'identifier'>[]>;
    };

   

    /** 添加产品 */
    addProduct: {
        request: {
            /** 名称 */
            name?: string;
            /** 集成 ID */
            integration: ApiKey;
            /** 集成新增产品需要的额外信息 */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };

    /** 删除产品 */
    deleteProducts: {
        request: {
            product_id_list: ApiKey[];
        };
        response: unknown;
    };
}

/**
 * 产品相关 API 服务
 */
export default attachAPI<ProductAPISchema>(client, {
    apis: {
        getProductList: `POST ${API_PREFIX}/product/search`,
        addProduct: `POST ${API_PREFIX}/product`,
        deleteProducts: `POST ${API_PREFIX}/product/batch-delete`,
    },
});
