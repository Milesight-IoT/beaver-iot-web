import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import vitePluginImport from 'vite-plugin-imp';
import stylelint from 'vite-plugin-stylelint';
// import progress from 'vite-plugin-progress';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import {
    parseEnvVariables,
    getViteEnvVarsConfig,
    getViteCSSConfig,
    getViteBuildConfig,
    getViteEsbuildConfig,
    customChunkSplit,
    chunkSplitPlugin,
} from '@milesight/scripts';
import { version } from './package.json';

const isProd = process.env.NODE_ENV === 'production';
const projectRoot = path.join(__dirname, '../../');
const {
    WEB_DEV_PORT,
    WEB_API_ORIGIN,
    WEB_WS_HOST,
    WEB_API_PROXY,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    WEB_SOCKET_PROXY,
} = parseEnvVariables([
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '.env.local'),
]);
const runtimeVariables = getViteEnvVarsConfig({
    // APP_TYPE: 'web',
    APP_VERSION: version,
    APP_API_ORIGIN: WEB_API_ORIGIN,
    APP_OAUTH_CLIENT_ID: OAUTH_CLIENT_ID,
    APP_OAUTH_CLIENT_SECRET: OAUTH_CLIENT_SECRET,
    APP_WS_HOST: WEB_WS_HOST,
});
const DEFAULT_LESS_INJECT_MODULES = [
    '@import "@milesight/shared/src/styles/variables.less";',
    '@import "@milesight/shared/src/styles/mixins.less";',
];

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        nodePolyfills({
            include: ['buffer', 'process'],
            globals: {
                Buffer: true,
                process: true,
            },
        }),
        stylelint({
            fix: true,
            cacheLocation: path.join(__dirname, 'node_modules/.cache/.stylelintcache'),
            emitWarning: !isProd,
        }),
        /**
         * 优化构建速度，减少在编译时的 Tree-Shaking 检查及资源处理
         */
        vitePluginImport({
            libList: [
                {
                    libName: '@mui/material',
                    libDirectory: '',
                    camel2DashComponentName: false,
                },
                {
                    libName: '@mui/icons-material',
                    libDirectory: '',
                    camel2DashComponentName: false,
                },
            ],
        }),
        chunkSplitPlugin({
            customChunk: customChunkSplit,
        }),
        react(),
        // progress(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // src 路径别名
        },
    },

    define: runtimeVariables,
    css: getViteCSSConfig(DEFAULT_LESS_INJECT_MODULES),
    build: getViteBuildConfig(),
    esbuild: getViteEsbuildConfig(),

    server: {
        host: '0.0.0.0',
        port: WEB_DEV_PORT,
        open: true,
        proxy: {
            '/api': {
                target: WEB_API_PROXY,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api\/v1/, ''),
            },
            '/websocket': {
                target: WEB_SOCKET_PROXY,
                ws: true, // 启用 WebSocket 代理
                changeOrigin: true,
            },
        },
    },
});
