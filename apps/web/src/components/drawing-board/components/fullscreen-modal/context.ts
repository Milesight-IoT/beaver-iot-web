import { createContext } from 'react';
import { type SxProps } from '@mui/material';

export interface PluginFullscreenContextProps {
    /**
     * Current plugin is fullscreen modal mode
     */
    pluginFullScreen?: boolean;
    setExtraFullscreenSx: React.Dispatch<React.SetStateAction<SxProps | undefined>>;
    setOnFullscreen: React.Dispatch<React.SetStateAction<(() => void) | undefined>>;
    changeIsFullscreen: (isFullscreen: boolean) => void;
}

export const PluginFullscreenContext = createContext<PluginFullscreenContextProps | null>(null);
