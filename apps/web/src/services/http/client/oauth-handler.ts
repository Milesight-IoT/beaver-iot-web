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
import { delay } from '@milesight/shared/src/utils/tools';
import iotStorage, {
    TOKEN_CACHE_KEY,
    DEFAULT_CACHE_PREFIX,
} from '@milesight/shared/src/utils/storage';
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
/** Storage key for cross-tab token refresh lock */
const TOKEN_REFRESH_LOCK_KEY = 'token_refresh_lock';
/** Lock timeout: 30 seconds */
const LOCK_TIMEOUT = 30 * 1000;
/** Max wait time for token refresh across tabs: 35 seconds */
const MAX_WAIT_TIME = 35 * 1000;

/**
 * Generate Authorization request header data
 * @param token Login certificate
 */
const genAuthorization = (token?: string) => {
    if (!token) return;
    return `Bearer ${token}`;
};

/**
 * Cross-tab lock structure
 */
type RefreshLock = {
    /** Tab ID that holds the lock */
    tabId: string;
    /** Lock timestamp */
    timestamp: number;
};

/**
 * Generate unique tab ID
 */
const tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

/**
 * Try to acquire cross-tab lock for token refresh
 */
const tryAcquireLock = async (): Promise<boolean> => {
    // 0-100 Random delay to avoid the lock being acquired at the same millisecond
    await delay(Math.random() * 95 + 5);

    const lockData = iotStorage.getItem<RefreshLock>(TOKEN_REFRESH_LOCK_KEY);
    const now = Date.now();

    // No lock exists or lock has expired
    if (!lockData || now - lockData.timestamp > LOCK_TIMEOUT) {
        iotStorage.setItem(TOKEN_REFRESH_LOCK_KEY, {
            tabId,
            timestamp: now,
        });
        return true;
    }

    // Lock is held by another tab
    return false;
};

/**
 * Release the cross-tab lock
 */
const releaseLock = () => {
    const lockData = iotStorage.getItem<RefreshLock>(TOKEN_REFRESH_LOCK_KEY);
    // Only release if this tab holds the lock
    if (lockData?.tabId === tabId) {
        iotStorage.removeItem(TOKEN_REFRESH_LOCK_KEY);
    }
};

/**
 * Wait for token to be refreshed by another tab
 * Uses storage event for real-time notification, with polling as fallback
 */
const waitForTokenRefresh = (initialToken: TokenDataType): Promise<TokenDataType | undefined> => {
    return new Promise(resolve => {
        const startTime = Date.now();
        const initialExpiry = initialToken.expires_in;
        let timeoutId: NodeJS.Timeout | null = null;
        let resolved = false;

        const cleanup = (token?: TokenDataType) => {
            if (resolved) return;
            resolved = true;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            window.removeEventListener('storage', storageHandler);

            // Notify local subscribers when token is updated
            if (token) {
                eventEmitter.publish(REFRESH_TOKEN_TOPIC, token);
            }

            resolve(token);
        };

        // Storage event handler for real-time updates from other tabs
        const storageHandler = (event: StorageEvent) => {
            // console.log('Storage event received:', event);
            if (event.key !== `${DEFAULT_CACHE_PREFIX}${TOKEN_CACHE_KEY}` || !event.newValue) {
                return;
            }

            try {
                const newToken = JSON.parse(event.newValue)?.value as TokenDataType;

                // Verify token was actually refreshed
                if (newToken.expires_in !== initialExpiry) {
                    // console.log('Token successfully refreshed:', newToken);
                    cleanup(newToken);
                }
            } catch (error) {
                console.error('Failed to parse token from storage event:', error);
            }
        };

        // Fallback polling in case storage event doesn't fire
        const checkToken = () => {
            const elapsed = Date.now() - startTime;

            // Timeout: let caller handle retry
            if (elapsed > MAX_WAIT_TIME) {
                cleanup(undefined);
                return;
            }

            const currentToken = iotStorage.getItem<TokenDataType>(TOKEN_CACHE_KEY);
            // Token has been updated
            if (currentToken && currentToken.expires_in !== initialExpiry) {
                cleanup(currentToken);
                return;
            }

            // Check again after a short delay
            timeoutId = setTimeout(checkToken, 200);
        };

        // Listen to storage events for real-time updates
        window.addEventListener('storage', storageHandler);

        // Start polling as fallback
        checkToken();
    });
};

let refreshPending = false;
const pendingPromises: {
    resolve: (token: TokenDataType | undefined) => void;
    reject: (reason?: any) => void;
}[] = [];

const getTokenSilent = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<TokenDataType | undefined>(async (resolve, reject) => {
        const token = iotStorage.getItem<TokenDataType>(TOKEN_CACHE_KEY);
        const isExpired = token && Date.now() >= token.expires_in;

        if (!token || !isExpired) {
            resolve(token);
            return;
        }

        pendingPromises.push({ resolve, reject });

        // Try to acquire cross-tab lock
        const hasLock = await tryAcquireLock();
        // console.log('hasLock', hasLock, Date.now());

        if (!hasLock) {
            // Another tab is refreshing, wait for it
            refreshPending = true;
            waitForTokenRefresh(token)
                .then(refreshedToken => {
                    const promiseToResolve = pendingPromises.slice();
                    refreshPending = false;
                    pendingPromises.length = 0;

                    if (refreshedToken) {
                        // Another tab successfully refreshed the token
                        promiseToResolve.forEach(({ resolve }) => {
                            resolve(refreshedToken);
                        });
                    } else {
                        // Timeout: retry token refresh
                        promiseToResolve.forEach(({ resolve }) => {
                            getTokenSilent().then(resolve).catch(reject);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error waiting for token refresh:', error);
                    const promiseToResolve = pendingPromises.slice();
                    refreshPending = false;
                    pendingPromises.length = 0;

                    promiseToResolve.forEach(({ reject }) => {
                        reject(error);
                    });
                });
        }
        if (refreshPending) return;

        // This tab acquired the lock, proceed with refresh
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
                releaseLock();

                if (data) {
                    // The token is refreshed every 60 minutes
                    data.expires_in = Date.now() + 60 * 60 * 1000;
                    iotStorage.setItem(TOKEN_CACHE_KEY, data);
                }

                promiseToResolve.forEach(({ resolve }) => {
                    resolve(data);
                });

                // Notify local subscribers
                eventEmitter.publish(REFRESH_TOKEN_TOPIC, data);
            })
            .catch(async err => {
                const promiseToResolve = pendingPromises.slice();

                console.error(err);
                refreshPending = false;
                pendingPromises.length = 0;
                releaseLock();

                // Delay 1 second to avoid repeated requests to refresh the token
                await delay(1000);
                const newToken = iotStorage.getItem<TokenDataType>(TOKEN_CACHE_KEY);
                const isExpired = newToken && Date.now() >= newToken.expires_in;

                // Multi-tab refresh token race condition
                if (newToken && !isExpired) {
                    promiseToResolve.forEach(({ resolve }) => {
                        resolve(newToken);
                    });
                    return;
                }

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
