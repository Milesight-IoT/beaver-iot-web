import { API_PREFIX, client, attachAPI } from '@/services/http/client';

/**
 * 设备相关接口定义
 */
export interface ToiletAPISchema extends APISchema {
    /** 更新组件 */
    uploadImg: {
        request: Record<string, any>;
        response: unknown;
    };
}

/**
 * 设备相关 API 服务
 */
export default attachAPI<ToiletAPISchema>(client, {
    apis: {
        uploadImg: `POST ${API_PREFIX}/public/integration/lavatory/file/upload`,
    },
});
