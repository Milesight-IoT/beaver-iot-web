import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig, type PluginOption } from 'vite';
import vitePluginImport from 'vite-plugin-imp';
import stylelint from 'vite-plugin-stylelint';
import basicSsl from '@vitejs/plugin-basic-ssl'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import {
    parseEnvVariables,
    getViteEnvVarsConfig,
    getViteCSSConfig,
    getViteBuildConfig,
    getViteEsbuildConfig,
    customChunkSplit,
    chunkSplitPlugin,
    vConsolePlugin,
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
    MOCK_API_PROXY,
    ENABLE_HTTPS,
    ENABLE_VCONSOLE,
} = parseEnvVariables([
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.local'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '.env.local'),
]);
const runtimeVariables = getViteEnvVarsConfig({
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

const plugins: PluginOption[] = [
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
     * Optimize build speed and reduce Tree-Shaking checks and resource processing at compile time
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
    vConsolePlugin({
        enable: !isProd && ENABLE_VCONSOLE === 'true',
    }),
    react(),
];

const enableHttps = ENABLE_HTTPS === 'true';

// Enable HTTPS for development
if (!isProd && enableHttps) {
    plugins.push(basicSsl({ name: 'beaver-web-dev' }));
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // src path alias
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
            '/mqtt': {
                target: WEB_SOCKET_PROXY,
                ws: true, // Enable the WebSocket proxy
                changeOrigin: true,
            },
            '/mock': {
                target: MOCK_API_PROXY,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/mock/, ''),
            },
        },
    },
});
