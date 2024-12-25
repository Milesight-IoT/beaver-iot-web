/** 应用运行的模式 */
export const mode = process.env.NODE_ENV as string;

/** 应用接口 Origin */
export const apiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN === '/'
	? process.env.EXPO_PUBLIC_API_PROXY as string
	: process.env.EXPO_PUBLIC_API_ORIGIN as string;

/** Websocket Host */
export const wsHost = process.env.EXPO_PUBLIC_WS_HOST === '/'
	? process.env.EXPO_PUBLIC_SOCKET_PROXY as string
	: process.env.EXPO_PUBLIC_WS_HOST as string;

/**
 * 应用版本号
 */
export const appVersion = process.env.EXPO_PUBLIC_APP_VERSION as string;

/** OAuth Client ID */
export const oauthClientID = process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID as string;

/** OAuth Client Secret */
export const oauthClientSecret = process.env.EXPO_PUBLIC_OAUTH_CLIENT_SECRET as string;

/** url 中标识当前 tab 的 key 参数 */
export const URL_TAB_SEARCH_KEY = process.env.EXPO_PUBLIC_URL_TAB_SEARCH_KEY as string;

/** 刷新token主题 */
export const REFRESH_TOKEN_TOPIC = process.env.EXPO_PUBLIC_REFRESH_TOKEN_TOPIC as string;
