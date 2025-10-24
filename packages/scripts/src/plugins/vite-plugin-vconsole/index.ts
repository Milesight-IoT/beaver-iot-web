import type { Plugin } from 'vite';

export interface VConsolePluginOptions {
    /**
     * Enable vConsole plugin
     * @default false
     */
    enable?: boolean;
    /**
     * vConsole source, it must be a url
     * @default https://unpkg.com/vconsole@latest/dist/vconsole.min.js
     */
    src?: string;
    /**
     * vConsole theme
     * @default light
     */
    theme?: 'light' | 'dark';
}

const defaultSrc = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js';

/**
 * Vite plugin to inject vconsole
 */
export default function vConsolePlugin(options: VConsolePluginOptions): Plugin {
    return {
        name: 'vite-plugin-vconsole',
        enforce: 'pre',
        transformIndexHtml(html) {
            if (!options.enable) return html;
            const injectTo = 'head-prepend';

            return [
                {
                    tag: 'script',
                    attrs: {
                        src: options.src || defaultSrc,
                    },
                    injectTo,
                },
                {
                    tag: 'script',
                    children: `
                        const isMobile = /Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(window.navigator.userAgent);
                        const isDebug = window.sessionStorage.getItem('vconsole') === 'true';
                        const vConsole = (isMobile && isDebug) ? new window.VConsole({ theme: "${options.theme ?? 'light'}" }) : null;
                    `.trim(),
                    injectTo,
                },
            ];
        },
    };
}
