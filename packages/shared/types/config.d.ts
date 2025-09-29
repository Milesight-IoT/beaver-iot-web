/**
 * Environment variables injected during build
 */
interface ImportMetaEnv {
    /**
     * Runtime mode of application
     * @param development development
     * @param production  production
     */
    readonly MODE: 'development' | 'production';

    /**
     * The basic URL for deploying an application is determined by the `base` config
     * item in the Vite configuration file
     */
    readonly BASE_URL: string;

    /**
     * Is running in a production environment
     */
    readonly PROD: boolean;

    /**
     * Is running in a development environment
     */
    readonly DEV: boolean;
}

/**
 * Module Type
 */
type ModuleType = {
    [key: string]: () => Promise<any>;
};

interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly glob: (pattern: string, options?: Record<string, any>) => ModuleType;
}

interface Window {
    $metaEnv: {
        /** Build timestamp */
        buildTime?: string | Date;
        /** The latest commit hash when building */
        latestGitHash?: string;
    };
}

/** App version */
declare const __APP_VERSION__: string;
/** App API origin */
declare const __APP_API_ORIGIN__: string;
/** Websocket Host */
declare const __APP_WS_HOST__: string;
/** OAuth Client ID */
declare const __APP_OAUTH_CLIENT_ID__: string;
/** OAuth Client Secret */
declare const __APP_OAUTH_CLIENT_SECRET__: string;
/** Build timestamp */
declare const __BUILD_TIMESTAMP__: number;
/** The branch when building */
declare const __GIT_BRANCH__: string;
/** The latest commit hash when building */
declare const __LATEST_COMMIT_HASH__: string;
/** Whether enable VConsole in mobile device */
declare const __APP_ENABLE_VCONSOLE__: boolean;
