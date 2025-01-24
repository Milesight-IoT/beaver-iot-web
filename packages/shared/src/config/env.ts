const { origin, host } = window.location;

// Globally expose build time and build Hash information for quick troubleshooting
window.$metaEnv = {
    buildTime: __BUILD_TIMESTAMP__ ? new Date(+__BUILD_TIMESTAMP__) : '',
    latestGitHash: __LATEST_COMMIT_HASH__,
};

/** Application running mode */
export const mode = import.meta.env.MODE;

/** Application interface Origin */
export const apiOrigin = __APP_API_ORIGIN__ === '/' ? origin : __APP_API_ORIGIN__;

/** Websocket Host */
export const wsHost = !__APP_WS_HOST__ || __APP_WS_HOST__ === '/' ? host : __APP_WS_HOST__;

/**
 * Application version number
 */
export const appVersion = __APP_VERSION__ || '';

/** OAuth Client ID */
export const oauthClientID = __APP_OAUTH_CLIENT_ID__;

/** OAuth Client Secret */
export const oauthClientSecret = __APP_OAUTH_CLIENT_SECRET__;
