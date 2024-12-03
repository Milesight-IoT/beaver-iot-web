/**
 * 构建时注入的环境变量
 */
interface ImportMetaEnv {
    /**
     * 应用运行的模式
     * @param development 本地开发环境
     * @param production  CI 构建环境
     */
    readonly MODE: 'development' | 'production';

    /**
     *  部署应用时的基本 URL，有 Vite 配置文件中的 `base` 配置项决定
     */
    readonly BASE_URL: string;

    /**
     * 应用是否运行在生产环境
     */
    readonly PROD: boolean;

    /**
     * 应用是否运行在开发环境
     */
    readonly DEV: boolean;
}
// 定义一个模块类型
type ModuleType = {
    [key: string]: () => Promise<any>;
};
interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly glob: (pattern: string, options?: Record<string, any>) => ModuleType;
}

interface Window {
    $metaEnv: {
        /** 构建时间 */
        buildTime?: string | Date;
        /** 构建时的 Commit Hash */
        latestGitHash?: string;
    };
}

/** 应用版本 */
declare const __APP_VERSION__: string;
/** 应用接口 Origin */
declare const __APP_API_ORIGIN__: string;
/** Websocket Host */
declare const __APP_WS_HOST__: string;
/** 应用 OAuth Client ID */
declare const __APP_OAUTH_CLIENT_ID__: string;
/** 应用 OAuth Client Secret */
declare const __APP_OAUTH_CLIENT_SECRET__: string;
/** 应用打包时间戳 */
declare const __BUILD_TIMESTAMP__: number;
/** 应用打包分支 */
declare const __GIT_BRANCH__: string;
/** 应用打包时的 commit hash */
declare const __LATEST_COMMIT_HASH__: string;
