import React, { useState, useMemo, useEffect } from 'react';
import { Box, IconButton, type SxProps, List } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useTheme } from '@milesight/shared/src/hooks';
import {
    FullscreenIcon,
    FullscreenExitIcon,
    Modal,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { PluginFullscreenContext, PluginFullscreenContextProps } from './context';

export interface FullscreenModalProps {
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
    const { children, disabled, sx, onFullscreen } = props;

    const { matchTablet } = useTheme();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

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

        if (!isFullscreen) {
            setShowContent(false);
        }
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
    if (matchTablet || disabled) {
        return children;
    }

    if (isFullscreen) {
        return (
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
                    transitionProps={{
                        onEntering: () => {
                            setShowLoading(true);
                        },
                        onEntered: () => {
                            setShowContent(true);
                            setShowLoading(false);
                        },
                    }}
                >
                    {showLoading && (
                        <LoadingWrapper loading>
                            <List sx={{ height: '300px' }} />
                        </LoadingWrapper>
                    )}
                    {showContent ? children : null}
                    <Box component="div" sx={iconSx} onClick={exitFullscreen}>
                        <IconButton size="small">
                            <FullscreenExitIcon sx={{ width: '20px', height: '20px' }} />
                        </IconButton>
                    </Box>
                </Modal>
            </PluginFullscreenContext.Provider>
        );
    }

    return (
        <>
            {children}
            <Box component="div" sx={iconSx} onClick={enterFullscreen}>
                <IconButton size="small">
                    <FullscreenIcon sx={{ width: '20px', height: '20px' }} />
                </IconButton>
            </Box>
        </>
    );
};

export default FullscreenModal;
export { PluginFullscreenContext, type PluginFullscreenContextProps } from './context';
