import type { AxiosRequestConfig } from 'axios';
import { apiOrigin } from '@milesight/shared/src/config';
import {
    createRequestClient,
    attachAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
} from '@milesight/shared/src/utils/request';
import { getCurrentComponentLang } from '@milesight/shared/src/services/i18n';
import oauthHandler from './oauth-handler';
import errorHandler from './error-handler';

/**
 * Configuring the service request header (You can configure the non-dynamic request header in headers)
 */
const headersHandler = async (config: AxiosRequestConfig) => {
    config.headers = config.headers || {};
    config.headers['Accept-Language'] = getCurrentComponentLang();

    return config;
};

/**
 * Interface request address configuration
 */
const apiOriginHandler = async (config: AxiosRequestConfig) => {
    const { baseURL } = config;
    // If the interface has already replaced the URL, no further processing is required
    if (baseURL?.startsWith('http')) return config;

    if (apiOrigin) {
        config.baseURL = apiOrigin;
    }

    return config;
};

const client = createRequestClient({
    baseURL: '/',
    // TODO: authenticates the oauthHandler
    configHandlers: [headersHandler, apiOriginHandler, oauthHandler],
    onResponse(resp) {
        // Error handling
        errorHandler(resp.data.error_code, resp);
        return resp;
    },
    onResponseError(error) {
        const resp = error.response;
        // @ts-ignore
        errorHandler(resp?.data?.error_code || error.code, resp || error);
        return error;
    },
});

export * from './constant';
export { client, attachAPI, awaitWrap, getResponseData, isRequestSuccess };
