import { client, attachAPI, API_PREFIX } from './client';

/**
 * 设备详情定义
 */
export interface DeviceDetail {
    /** ID */
    id: ApiKey;
    /** Key */
    key: ApiKey;
    /** 名称 */
    name: string;
    /** 设备标识 */
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
 * 设备相关接口定义
 */
export interface DeviceAPISchema extends APISchema {
    /** 获取设备列表 */
    getList: {
        request: SearchRequestType & {
            /** 名称（模糊搜索） */
            name?: string;
        };
        response: SearchResponseType<Omit<DeviceDetail, 'identifier'>[]>;
    };

    /** 获取设备详情 */
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

    /** 添加设备 */
    addDevice: {
        request: {
            /** 名称 */
            name?: string;
            /** 集成 ID */
            integration: ApiKey;
            /** 集成新增设备需要的额外信息 */
            param_entities: Record<string, any>;
        };
        response: unknown;
    };

    /** 删除设备 */
    deleteDevices: {
        request: {
            device_id_list: ApiKey[];
        };
        response: unknown;
    };

    /** 更新设备 */
    updateDevice: {
        request: {
            id: ApiKey;
            /** 名称 */
            name: string;
        };
        response: unknown;
    };

    /** 图像分析 */
    imageAnalyze: {
        request: {
            image: string;
        };
        response: unknown;
    };
}

/**
 * 设备相关 API 服务
 */
export default attachAPI<DeviceAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/device/search`,
        getDetail: `GET ${API_PREFIX}/device/:id`,
        addDevice: `POST ${API_PREFIX}/device`,
        deleteDevices: `POST ${API_PREFIX}/device/batch-delete`,
        updateDevice: `PUT ${API_PREFIX}/device/:id`,
        imageAnalyze: `POST aaa/vms-integration/object-detection`,
    },
});
