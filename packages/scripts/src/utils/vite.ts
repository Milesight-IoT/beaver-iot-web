import { execSync } from 'child_process';
import { ESBuildOptions } from 'vite';
import { staticImportedScan, CustomChunk } from '../plugins';

/**
 * Concatenation generates runtime variables
 * @param appVars Variable object
 *
 * Note: This function requires that the variables injected into the page must be named `__${name}__`. Do not mount data under `import.meta.env`, as this can easily lead to unstable vendor chunk hashes after build compilation, causing vendor cache invalidation even if dependencies have not changed. (For example: zustand, dayjs internally rely on `import.meta.env?.MODE` for logical judgments)
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

    // Note: Injected variables will affect the stability of the resource hash after compilation and construction, so do not export
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
 * Get the general CSS configuration
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
 * Get the common build configuration
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
 * Get the common Esbuild configuration
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
 * Common Vite subcontracting strategy
 */
export const customChunkSplit: CustomChunk = ({ id }, { getModuleInfo }) => {
    // CSS subcontracting
    if (/\.(css|less)/.test(id)) {
        if (/src\/styles\/index\.less/.test(id)) {
            return 'style-common';
        }

        if (/shared\/src\//.test(id)) {
            return 'style-shared';
        }

        return 'style-pages';
    }

    // International copywriting subcontracting
    if (/packages\/locales\//.test(id)) {
        const match = /\/lang\/(.+)\//.exec(id);
        const lang = match && match[1];

        if (lang) return `i18n-${lang}`;

        return `i18n-helper`;
    }

    // Component library subcontracting
    if (id.includes('node_modules') && id.includes('@mui')) {
        return 'mui';
    }

    if (/packages\/shared\//.test(id)) {
        if (staticImportedScan(id, getModuleInfo, new Map(), [])) {
            return 'shared';
        }
    }
};
