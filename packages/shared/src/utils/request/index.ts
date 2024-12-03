import { stringify } from 'qs';
import axios, { AxiosInstance, AxiosError, CreateAxiosDefaults } from 'axios';
import { getObjectType } from '../tools';
import {
    RequestPath,
    RequestOptions,
    AttachAPIOptions,
    CreateRequestConfig,
    CreateRequestClient,
} from './types';

const MATCH_METHOD = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|CONNECT|TRACE|PATCH)\s+/;
const MATCH_PATH_PARAMS = /:(\w+)/g;
const USE_DATA_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * 创建 API 请求
 */
export function attachAPI<T extends APISchema>(
    client: AxiosInstance,
    { apis, onError, onResponse }: AttachAPIOptions<T>,
) {
    const hostApi: CreateRequestClient<T> = Object.create(null);

    // eslint-disable-next-line
    for (const apiName in apis) {
        const apiConfig = apis[apiName];

        // 配置为一个函数
        if (typeof apiConfig === 'function') {
            // hostApi[apiName] = apiConfig as RequestFunction;
            hostApi[apiName] = (...args) => {
                return apiConfig(...args)
                    .then(resp => {
                        if (onResponse) {
                            return onResponse(resp);
                        }

                        return resp;
                    })
                    .catch(error => {
                        if (onError) {
                            return onError(error);
                        }
                        throw error;
                        return error;
                    });
            };
            continue;
        }

        let apiOptions = {};
        let apiPath = apiConfig as RequestPath;

        // 配置为一个对象
        if (typeof apiConfig === 'object') {
            const { path, method = 'GET', ...rest } = apiConfig as RequestOptions;
            apiPath = (
                path.match(MATCH_METHOD) ? path : `${method.toUpperCase()} ${path}`
            ) as RequestPath;
            apiOptions = rest;
        }

        hostApi[apiName] = (params, options) => {
            const _params = getObjectType(params) === 'object' ? { ...params } : params || {};
            // 匹配路径中请求方法，如：'POST /api/test'
            const [prefix, method] = apiPath.match(MATCH_METHOD) || ['GET ', 'GET'];
            // 剔除掉 GET/POST 等前缀
            let url = apiPath.replace(prefix, '');
            // 匹配路径中的参数占位符， 如 '/api/:user_id/:res_id'
            const matchParams = apiPath.match(MATCH_PATH_PARAMS);

            if (matchParams && typeof _params === 'object') {
                matchParams.forEach(match => {
                    const key = match.replace(':', '');
                    if (Reflect.has(_params, key)) {
                        url = url.replace(match, Reflect.get(_params, key));
                        Reflect.deleteProperty(_params, key);
                    }
                });
            }

            const requestParams = USE_DATA_METHODS.includes(method)
                ? { data: _params }
                : { params: _params };

            return client
                .request({
                    url,
                    method: method.toLowerCase(),
                    ...requestParams,
                    ...apiOptions,
                    ...options,
                })
                .then(resp => {
                    if (onResponse) {
                        return onResponse(resp);
                    }

                    return resp;
                })
                .catch(error => {
                    if (onError) {
                        return onError(error);
                    }

                    throw error;
                    return error;
                });
        };
    }

    return hostApi;
}

/**
 * 创建请求客户端
 */
export function createRequestClient({
    configHandlers,
    onConfigError,
    onResponse,
    onResponseError,
    ...restConfig
}: CreateRequestConfig): AxiosInstance {
    const client = axios.create({
        withCredentials: true,
        paramsSerializer(params: any) {
            return stringify(params, { arrayFormat: 'repeat' });
        },
        ...restConfig,
    });

    // 附加各业务请求头
    client.interceptors.request.use(
        config => {
            const configHandlersPromise = (configHandlers || []).map(handler => {
                return handler(config)
                    .then((mixConfigs: CreateAxiosDefaults) => {
                        Object.assign(config, mixConfigs);
                    })
                    .catch();
            });
            return Promise.all(configHandlersPromise).then(() => config);
        },
        (error: AxiosError) => {
            const requestError = onConfigError ? onConfigError(error) : error;

            return Promise.reject(requestError);
        },
    );

    // 拦截请求
    client.interceptors.response.use(
        resp => {
            if (onResponse) {
                return onResponse(resp);
            }

            return resp;
        },
        (error: AxiosError) => {
            const requestError = onResponseError ? onResponseError(error) : error;

            return Promise.reject(requestError);
        },
    );

    return client;
}

/**
 * 通用请求接口前缀
 *
 * 注意：若各平台接口前缀不同，应在各自 client 初始化时自行处理
 */
export const apiPrefix = '/api/v1';
export const apiPrefixDevice = `/device${apiPrefix}`;
export const apiPrefixAccount = `/account${apiPrefix}`;
export const apiPrefixCenter = `/center${apiPrefix}`;
export const apiPrefixTools = `/tool${apiPrefix}`;
export const apiPrefixTask = `/task${apiPrefix}`;

// 导出所有工具函数
export * from './utils';

// 导出请求处理中间件
export * from './handlers';

// 导出取消请求处理函数
export { default as cancelRequest, cacheRequestCancelToken } from './cancel-request';
