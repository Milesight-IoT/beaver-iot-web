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
    /** 鉴权 Token */
    access_token: string;
    /** 刷新 Token */
    refresh_token: string;
    /**
     * 过期时间，单位 ms
     *
     * 注意：该值为前端过期时间，仅用于判断何时需刷新 token，实际 token 在后端可能还未过期
     */
    expires_in: number;
};

let timer: number | null = null;
/** Token 延迟刷新时间 */
const REFRESH_TOKEN_TIMEOUT = 1 * 1000;
/** Token 刷新 API 路径 */
const tokenApiPath = `${API_PREFIX}/oauth2/token`;
/**
 * 生成 Authorization 请求头数据
 * @param token 登录凭证
 */
const genAuthorization = (token?: string) => {
    if (!token) return;
    return `Bearer ${token}`;
};

/**
 * Token 处理逻辑（静默处理）
 *
 * 1. 判断缓存中 token 是否合法，若合法则写入请求 header 中
 * 2. 定时刷新 token，每 60 分钟刷新一次
 */
const oauthHandler = async (config: AxiosRequestConfig) => {
    const token = iotStorage.getItem<TokenDataType>(TOKEN_CACHE_KEY);
    const isExpired = token && Date.now() >= token.expires_in;
    const isOauthRequest = config.url?.includes('oauth2/token');

    if (token?.access_token && !isOauthRequest) {
        config.headers = config.headers || {};
        config.headers.Authorization = genAuthorization(token?.access_token);
    }

    /**
     * 1. 若为 oauth 请求，不做刷新 token 处理
     * 2. 若本地无缓存 token，不做刷新 token 处理
     * 3. 若本地缓存 token 未过期，不做刷新 token 处理
     */
    if (isOauthRequest || !token?.access_token || !isExpired) {
        return config;
    }

    /**
     * 延迟 1s 后发起 token 更新请求，保证在此 1s 内，使用旧 token 的请求依然可通过后端鉴权
     */
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
        const requestConfig = {
            baseURL: apiOrigin,
            headers: {
                Authorization: genAuthorization(token?.access_token),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
        };
        const requestData = {
            refresh_token: token.refresh_token,
            grant_type: 'refresh_token',
            client_id: oauthClientID,
            client_secret: oauthClientSecret,
        };

        axios
            .post<ApiResponse<TokenDataType>>(tokenApiPath, requestData, requestConfig)
            .then(resp => {
                const data = getResponseData(resp)!;

                // 每 60 分钟刷新一次 token
                data.expires_in = Date.now() + 60 * 60 * 1000;
                iotStorage.setItem(TOKEN_CACHE_KEY, data);
                eventEmitter.publish(REFRESH_TOKEN_TOPIC);
            })
            .catch(_ => {
                // TODO: 若为 token 无效错误，则直接移除 token
                // iotStorage.removeItem(TOKEN_CACHE_KEY);
            });
    }, REFRESH_TOKEN_TIMEOUT);

    return config;
};

export default oauthHandler;
