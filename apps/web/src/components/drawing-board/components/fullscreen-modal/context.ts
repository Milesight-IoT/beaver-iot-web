import { createContext } from 'react';

export interface PluginFullscreenContextProps {
    /**
     * Current plugin is fullscreen modal mode
     */
    pluginFullScreen?: boolean;
    extraParams?: Record<string, any>;
    setExtraParams: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export const PluginFullscreenContext = createContext<PluginFullscreenContextProps | null>(null);
