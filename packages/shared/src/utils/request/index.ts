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
 * Create API requests
 */
export function attachAPI<T extends APISchema>(
    client: AxiosInstance,
    { apis, onError, onResponse }: AttachAPIOptions<T>,
) {
    const hostApi: CreateRequestClient<T> = Object.create(null);

    // eslint-disable-next-line
    for (const apiName in apis) {
        const apiConfig = apis[apiName];

        // If `apiConfig` is a function, it will be called directly
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

        // If `apiConfig` is an object, it will be merged into `apiOptions`
        if (typeof apiConfig === 'object') {
            const { path, method = 'GET', ...rest } = apiConfig as RequestOptions;
            apiPath = (
                path.match(MATCH_METHOD) ? path : `${method.toUpperCase()} ${path}`
            ) as RequestPath;
            apiOptions = rest;
        }

        hostApi[apiName] = (params, options) => {
            const _params = getObjectType(params) === 'object' ? { ...params } : params || {};
            // Match the request method in the `apiPath`, such as `POST /api/test`
            const [prefix, method] = apiPath.match(MATCH_METHOD) || ['GET ', 'GET'];
            // Remove the prefixes such as `GET/POST`
            let url = apiPath.replace(prefix, '');
            // Match the parameters in the `apiPath`, such as `/api/:user_id/:res_id`
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
 * Create request client
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

    // Additional business request header
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

    // Intercept request
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
 * General request path prefix
 *
 * Note: If the prefix of each platform interface is different, it should be handled by
 * yourself when the client initialization
 */
export const apiPrefix = '/api/v1';
export const apiPrefixDevice = `/device${apiPrefix}`;
export const apiPrefixAccount = `/account${apiPrefix}`;
export const apiPrefixCenter = `/center${apiPrefix}`;
export const apiPrefixTools = `/tool${apiPrefix}`;
export const apiPrefixTask = `/task${apiPrefix}`;

// Export all the tool functions
export * from './utils';

// Export the parallel limit function
export { default as pLimit } from './parallel-limit';

// Export request middlewares
export * from './handlers';

// Export the request cancel function
export { default as cancelRequest, cacheRequestCancelToken } from './cancel-request';
