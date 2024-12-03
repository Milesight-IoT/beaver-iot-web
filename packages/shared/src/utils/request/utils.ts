/**
 * 常用请求处理工具
 */
import type { AxiosResponse, AxiosError } from 'axios';

/**
 * 判断 API 请求是否成功
 */
export const isRequestSuccess = (resp?: AxiosResponse<ApiResponse>) => {
    const data = resp?.data;
    const { responseType } = resp?.config || {};

    if (responseType === 'blob') {
        return !!data && resp?.status === 200;
    }

    return !!data && !data.error_code && data.status === 'Success';
};

/**
 * 获取接口响应的 data 数据
 */
export const getResponseData = <T extends AxiosResponse<ApiResponse>>(
    resp?: T,
): T['data']['data'] | undefined => {
    const { responseType } = resp?.config || {};

    if (responseType === 'blob') {
        return resp?.data;
    }

    return resp?.data.data;
};

/**
 * Async/Await 错误处理封装器 (Inspired by await-to-js: https://github.com/scopsy/await-to-js)
 * @param {Promise} promise Promise
 * @param errorExt Additional Information you can pass to the err object
 * @returns {Promise} promise
 */
export const awaitWrap = <T, U = AxiosError>(
    promise: Promise<T>,
    errorExt?: object,
): Promise<[U, undefined] | [null, T]> => {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, undefined]>((err: U) => {
            if (errorExt) {
                const parsedError = { ...err, ...errorExt };
                return [parsedError, undefined];
            }

            return [err, undefined];
        });
};
