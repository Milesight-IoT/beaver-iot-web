import React, { useState, useMemo } from 'react';
import { Box, IconButton, type SxProps } from '@mui/material';
import { useMemoizedFn } from 'ahooks';
import { get } from 'lodash-es';

import { useTheme } from '@milesight/shared/src/hooks';
import { FullscreenIcon, FullscreenExitIcon } from '@milesight/shared/src/components';

import { PluginFullscreenContext, PluginFullscreenContextProps } from './context';
import { type BoardPluginProps, type PluginType } from '../../plugin/types';

export interface FullscreenModalProps {
    /**
     * Plugin id
     */
    id: ApiKey;
    plugin: BoardPluginProps;
    children?: React.ReactNode;
    /**
     * Disabled fullscreen
     */
    disabled?: boolean;
    /**
     * Plugin fullscreen icon sx custom style
     */
    sx?: SxProps;
    isFullscreen?: Record<string, boolean>;
    setIsFullscreen?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/**
 * Higher order component to fullscreen
 */
const FullscreenModal: React.FC<FullscreenModalProps> = props => {
    const { id, plugin, children, disabled, sx, isFullscreen, setIsFullscreen } = props;

    const { matchTablet } = useTheme();

    const [onFullscreen, setOnFullscreen] = useState<() => void>();
    const [extraFullscreenSx, setExtraFullscreenSx] = useState<SxProps>();

    const iconSx = useMemo((): SxProps => {
        return {
            position: 'absolute',
            top: '10px',
            right: '12px',
            zIndex: 'var(--mui-zIndex-modal, 1300)',
            ...sx,
            ...extraFullscreenSx,
        } as SxProps;
    }, [sx, extraFullscreenSx]);

    const pluginFullScreen = useMemo(() => get(isFullscreen, id, false), [isFullscreen, id]);

    const changeIsFullscreen = useMemoizedFn((isFullscreen: boolean) => {
        setIsFullscreen?.(isFullscreen ? { [id]: true } : {});
    });

    const contextVal = useMemo((): PluginFullscreenContextProps => {
        return {
            pluginFullScreen,
            setExtraFullscreenSx,
            setOnFullscreen,
            changeIsFullscreen,
        };
    }, [pluginFullScreen, changeIsFullscreen]);

    const enterFullscreen = useMemoizedFn(() => {
        if (disabled) {
            return;
        }

        setIsFullscreen?.({ [id]: true });
        onFullscreen?.();
    });

    const exitFullscreen = useMemoizedFn(() => {
        setIsFullscreen?.({});
        onFullscreen?.();
    });

    /**
     * Mobile compatible
     */
    const hiddenEnterFullscreen = useMemo(() => {
        return (matchTablet && (['deviceList'] as PluginType[]).includes(plugin?.type)) || disabled;
    }, [matchTablet, plugin, disabled]);

    const fullscreenIconSx: SxProps = useMemo(() => {
        const baseSx: SxProps = {
            width: '36px',
            height: '36px',
            color: 'text.secondary',
            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                color: 'text.secondary',
            },
        };

        if (matchTablet) {
            return baseSx;
        }

        return {
            ...baseSx,
            '&.MuiIconButton-root:hover': {
                backgroundColor: 'var(--hover-background-1)',
                borderRadius: '50%',
            },
        };
    }, [matchTablet]);

    return (
        <PluginFullscreenContext.Provider value={contextVal}>
            {children}
            {pluginFullScreen ? (
                <Box component="div" sx={iconSx} onClick={exitFullscreen}>
                    <IconButton disableRipple size="small" sx={fullscreenIconSx}>
                        <FullscreenExitIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </Box>
            ) : (
                <Box
                    component="div"
                    sx={{
                        ...iconSx,
                        display: hiddenEnterFullscreen ? 'none' : undefined,
                    }}
                    onClick={enterFullscreen}
                >
                    <IconButton disableRipple size="small" sx={fullscreenIconSx}>
                        <FullscreenIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </Box>
            )}
        </PluginFullscreenContext.Provider>
    );
};

export default FullscreenModal;
export { PluginFullscreenContext, type PluginFullscreenContextProps } from './context';
