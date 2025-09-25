import { createContext } from 'react';

export interface PluginFullscreenContextProps {
    /**
     * Current plugin is fullscreen modal mode
     */
    pluginFullScreen?: boolean;
}

export const PluginFullscreenContext = createContext<PluginFullscreenContextProps | null>(null);
