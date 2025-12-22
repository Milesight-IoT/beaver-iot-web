import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import {
    apiOrigin,
    oauthClientID,
    oauthClientSecret,
    REFRESH_TOKEN_TOPIC,
} from '@milesight/shared/src/config';
import eventEmitter from '@milesight/shared/src/utils/event-emitter';
import { getResponseData } from '@milesight/shared/src/utils/request';
import iotStorage, { TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import { API_PREFIX } from './constant';

type TokenDataType = {
    /** Authentication Token */
    access_token: string;
    /** Refresh Token */
    refresh_token: string;
    /**
     * Expiration time, unit: ms
     *
     * Note: This value is the front-end expiration time and is only used to determine when the token needs to be refreshed. The actual token may not have expired at the back-end
     */
    expires_in: number;
};

/** Token refresh API path */
const tokenApiPath = `${API_PREFIX}/oauth2/token`;
/**
 * Generate Authorization request header data
 * @param token Login certificate
 */
const genAuthorization = (token?: string) => {
    if (!token) return;
    return `Bearer ${token}`;
};

let refreshPending = false;
const pendingPromises: {
    resolve: (token: TokenDataType | undefined) => void;
    reject: (reason?: any) => void;
}[] = [];
const getTokenSilent = () => {
    return new Promise<TokenDataType | undefined>((resolve, reject) => {
        const token = iotStorage.getItem<TokenDataType>(TOKEN_CACHE_KEY);
        const isExpired = token && Date.now() >= token.expires_in;

        if (!token || !isExpired) {
            resolve(token);
            return;
        }

        pendingPromises.push({ resolve, reject });
        if (refreshPending) return;

        const requestConfig = {
            baseURL: apiOrigin,
            headers: {
                Authorization: genAuthorization(token.access_token),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 10000,
            withCredentials: true,
        };
        const requestData = {
            refresh_token: token.refresh_token,
            grant_type: 'refresh_token',
            client_id: oauthClientID,
            client_secret: oauthClientSecret,
        };

        refreshPending = true;
        axios
            .post<ApiResponse<TokenDataType>>(tokenApiPath, requestData, requestConfig)
            .then(resp => {
                const data = getResponseData(resp);
                const promiseToResolve = pendingPromises.slice();

                refreshPending = false;
                pendingPromises.length = 0;

                if (data) {
                    // The token is refreshed every 60 minutes
                    data.expires_in = Date.now() + 60 * 60 * 1000;
                    iotStorage.setItem(TOKEN_CACHE_KEY, data);
                }

                promiseToResolve.forEach(({ resolve }) => {
                    resolve(data);
                });

                eventEmitter.publish(REFRESH_TOKEN_TOPIC);
            })
            .catch(err => {
                const promiseToResolve = pendingPromises.slice();

                console.error(err);
                refreshPending = false;
                pendingPromises.length = 0;

                /**
                 * If the refresh token fails, set the original token expiration time to 1 minute later
                 * to avoid repeated requests to refresh the token
                 */
                token.expires_in = Date.now() + 1 * 60 * 1000;
                iotStorage.setItem(TOKEN_CACHE_KEY, token);

                promiseToResolve.forEach(({ resolve }) => {
                    resolve(token);
                });
            });
    });
};

/**
 * Token Processing Logic (Silent processing)
 *
 * 1. Check whether the token in the cache is valid. If yes, write the token into the request header
 * 2. Refresh the token periodically every 60 minutes
 */
const oauthHandler = async (config: AxiosRequestConfig) => {
    const isOauthRequest = config.url?.includes('oauth2/token');
    if (isOauthRequest) return config;

    const token = await getTokenSilent();

    if (token?.access_token) {
        config.headers = config.headers || {};
        config.headers.Authorization = genAuthorization(token?.access_token);
    }

    return config;
};

export default oauthHandler;
