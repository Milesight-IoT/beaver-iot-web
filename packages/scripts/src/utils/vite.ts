import { execSync } from 'child_process';
import { ESBuildOptions } from 'vite';
import { staticImportedScan, CustomChunk } from '../plugins';

/**
 * 拼接生成运行时变量
 * @param appVars 变量对象
 *
 * 注意：该函数规定注入页面的变量必须命名为 `__${name}__`，不可将数据挂载在 `import.meta.env` 下，否则极易导致
 * 构建编译后 vendor chunk hash 不稳定，出现依赖未变更但 vendor 缓存失效问题。（例如：zustand, dayjs 内部依赖 `import.meta.env?.MODE` 做逻辑判断）
 */
export const getViteEnvVarsConfig = (appVars: Record<string, any>) => {
    let hash = '';
    let branch = '';
    const genKeyName = (name: string) => `__${name}__`;
    try {
        branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        hash = execSync(`git log -1 --format="%H" ${branch}`, { encoding: 'utf-8' }).trim();
    } catch (e: any) {
        console.error(
            '🚫 Unable to get the latest commit hash. Please ensure that the current directory is the root directory of the Git repository and that a branch exists:',
            e?.message,
        );
    }

    // 注意：注入的变量会影响编译构建后资源 hash 的稳定性，故此处暂不做导出
    const result: Record<string, any> = {
        [genKeyName('BUILD_TIMESTAMP')]: JSON.stringify(Date.now()),
        [genKeyName('GIT_BRANCH')]: JSON.stringify(branch || ''),
        [genKeyName('LATEST_COMMIT_HASH')]: JSON.stringify(hash || ''),
    };

    Object.keys(appVars).forEach(key => {
        result[genKeyName(key)] = JSON.stringify(appVars[key]);
    });

    return result;
};

/**
 * 获取通用 CSS 配置
 */
export const getViteCSSConfig = (lessInjectModules: string[] = []) => {
    return {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                additionalData: lessInjectModules.join('\n'),
            },
        },
        devSourcemap: true,
    };
};

/**
 * 获取通用构建配置
 */
export const getViteBuildConfig = () => {
    return {
        // sourcemap: 'hidden',
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        terserOptions: {
            compress: {
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
            },
        },
        rollupOptions: {
            output: {
                assetFileNames: assetInfo => {
                    const info = assetInfo.name.split('.');
                    let extType = info[info.length - 1];
                    if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
                        extType = 'media';
                    } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
                        extType = 'img';
                    } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
                        extType = 'font';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },
    };
};

/**
 * 获取通用 Esbuild 配置
 */
export const getViteEsbuildConfig = (config?: ESBuildOptions) => {
    const result: ESBuildOptions = {
        drop: ['debugger'],
        pure: ['console.log', 'console.info'],
        ...config,
    };
    return result;
};

/**
 * 通用 Vite 分包策略
 */
export const customChunkSplit: CustomChunk = ({ id }, { getModuleInfo }) => {
    // CSS 分包
    if (/\.(css|less)/.test(id)) {
        if (/src\/styles\/index\.less/.test(id)) {
            return 'style-common';
        }

        if (/shared\/src\//.test(id)) {
            return 'style-shared';
        }

        return 'style-pages';
    }

    // 国际化文案分包
    if (/packages\/locales\//.test(id)) {
        const match = /\/lang\/(.+)\//.exec(id);
        const lang = match && match[1];

        if (lang) return `i18n-${lang}`;

        return `i18n-helper`;
    }

    // 组件库分包
    if (id.includes('node_modules') && id.includes('@mui')) {
        return 'mui';
    }

    if (/packages\/shared\//.test(id)) {
        if (staticImportedScan(id, getModuleInfo, new Map(), [])) {
            return 'shared';
        }
    }
};
