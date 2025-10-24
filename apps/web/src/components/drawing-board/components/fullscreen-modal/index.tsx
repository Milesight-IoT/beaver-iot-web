import React, { useState, useMemo, useEffect } from 'react';
import { Box, IconButton, type SxProps } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useTheme } from '@milesight/shared/src/hooks';
import { FullscreenIcon, FullscreenExitIcon, Modal } from '@milesight/shared/src/components';

import { PluginFullscreenContext, PluginFullscreenContextProps } from './context';
import { type BoardPluginProps, type PluginType } from '../../plugin/types';

export interface FullscreenModalProps {
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
    /** Is fullscreen callback */
    onFullscreen?: (isFullscreen: boolean) => void;
}

/**
 * Higher order component to fullscreen
 */
const FullscreenModal: React.FC<FullscreenModalProps> = props => {
    const { plugin, children, disabled, sx, onFullscreen } = props;

    const { matchTablet } = useTheme();

    const [isFullscreen, setIsFullscreen] = useState(false);

    const iconSx = useMemo((): SxProps => {
        return { position: 'absolute', top: '12px', right: '12px', ...sx };
    }, [sx]);

    const contextVal = useMemo((): PluginFullscreenContextProps => {
        return {
            pluginFullScreen: isFullscreen,
        };
    }, [isFullscreen]);

    useEffect(() => {
        onFullscreen?.(isFullscreen);
    }, [onFullscreen, isFullscreen]);

    const enterFullscreen = useMemoizedFn(() => {
        if (disabled) {
            return;
        }

        setIsFullscreen(true);
    });

    const exitFullscreen = useMemoizedFn(() => {
        setIsFullscreen(false);
    });

    /**
     * Mobile compatible
     */
    const hiddenEnterFullscreen = useMemo(() => {
        return (matchTablet && (['deviceList'] as PluginType[]).includes(plugin?.type)) || disabled;
    }, [matchTablet, plugin, disabled]);

    return (
        <>
            <PluginFullscreenContext.Provider value={contextVal}>
                <Modal
                    fullScreen
                    visible={isFullscreen}
                    showCloseIcon={false}
                    onCancel={exitFullscreen}
                    footer={null}
                    sx={{
                        '&.ms-modal-root .ms-modal-content.MuiDialogContent-root': {
                            padding: 0,
                        },
                    }}
                >
                    {children}
                    <Box component="div" sx={iconSx} onClick={exitFullscreen}>
                        <IconButton
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&.MuiIconButton-root:hover': {
                                    backgroundColor: 'var(--hover-background-1)',
                                    borderRadius: '50%',
                                },
                            }}
                        >
                            <FullscreenExitIcon sx={{ width: '20px', height: '20px' }} />
                        </IconButton>
                    </Box>
                </Modal>
            </PluginFullscreenContext.Provider>
            {isFullscreen ? null : (
                <>
                    {children}
                    <Box
                        component="div"
                        sx={{
                            ...iconSx,
                            display: hiddenEnterFullscreen ? 'none' : undefined,
                        }}
                        onClick={enterFullscreen}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&.MuiIconButton-root:hover': {
                                    backgroundColor: 'var(--hover-background-1)',
                                    borderRadius: '50%',
                                },
                            }}
                        >
                            <FullscreenIcon sx={{ width: '20px', height: '20px' }} />
                        </IconButton>
                    </Box>
                </>
            )}
        </>
    );
};

export default FullscreenModal;
export { PluginFullscreenContext, type PluginFullscreenContextProps } from './context';
