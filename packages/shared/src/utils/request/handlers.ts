/* eslint-disable camelcase */
/**
 * 通用请求处理中间件
 */
import type { AxiosRequestConfig } from 'axios';
import cancelRequest, { cacheRequestCancelToken } from './cancel-request';

/**
 * Language 请求头配置
 *
 * 注意：此中间件依赖 i18n 服务，若出现循环依赖，则该中间件应迁移至各平台各自处理
 */
// export const languageHandler = async (config: AxiosRequestConfig) => {
//     config.headers = config.headers || {};
//     config.headers['Accept-Language'] = getCurrentMomentLang();

//     return config;
// };

/**
 * 重复请求处理（默认不允许重复）
 *
 * 若要支持重复请求，可以传入 headers: { 'x-allow-repeat': true }
 */
export const cancelConfigHandler = async (config: AxiosRequestConfig) => {
    cancelRequest(config);
    // @ts-ignore
    if (config.$allowRepeat) {
        // @ts-ignore
        delete config.$allowRepeat;
        cacheRequestCancelToken(config);
    }

    return config;
};
