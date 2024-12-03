import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

const pendingMap = new Map();
/**
 * 生成每个请求唯一的键
 * @param {*} config
 * @returns string
 */
function generatePendingKey(config: AxiosRequestConfig) {
    const { url, method, params } = config;
    const { data } = config;

    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
}

/**
 * 储存每个请求唯一值, 也就是cancel()方法, 用于取消请求
 * @param {*} config
 */
function cacheRequestCancelToken(config: AxiosRequestConfig) {
    const pendingKey = generatePendingKey(config);

    // eslint-disable-next-line
    config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken(cancel => {
            if (!pendingMap.has(pendingKey)) {
                pendingMap.set(pendingKey, cancel);
            }
        });
}
/**
 * 删除重复的请求
 * @param {*} config
 */
function cancelRequest(config?: AxiosRequestConfig) {
    if (!config) return;

    const pendingKey = generatePendingKey(config);

    if (pendingMap.has(pendingKey)) {
        const cancelToken = pendingMap.get(pendingKey);
        cancelToken(pendingKey);
        pendingMap.delete(pendingKey);
    }
}

export default cancelRequest;
export { cacheRequestCancelToken };
