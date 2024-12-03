const { origin, host } = window.location;

// 全局暴露构建时间、构建 Hash 信息，以便快速排查问题
window.$metaEnv = {
    buildTime: __BUILD_TIMESTAMP__ ? new Date(+__BUILD_TIMESTAMP__) : '',
    latestGitHash: __LATEST_COMMIT_HASH__,
};

/** 应用运行的模式 */
export const mode = import.meta.env.MODE;

/** 应用接口 Origin */
export const apiOrigin = __APP_API_ORIGIN__ === '/' ? origin : __APP_API_ORIGIN__;

/** Websocket Host */
export const wsHost = !__APP_WS_HOST__ || __APP_WS_HOST__ === '/' ? host : __APP_WS_HOST__;

/**
 * 应用版本号
 */
export const appVersion = __APP_VERSION__ || '';

/** OAuth Client ID */
export const oauthClientID = __APP_OAUTH_CLIENT_ID__;

/** OAuth Client Secret */
export const oauthClientSecret = __APP_OAUTH_CLIENT_SECRET__;
