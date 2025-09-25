import React, { useState, useMemo, useEffect } from 'react';
import { Box, IconButton, type SxProps } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useTheme } from '@milesight/shared/src/hooks';
import { FullscreenIcon, FullscreenExitIcon, Modal } from '@milesight/shared/src/components';

export interface FullscreenModalProps {
    children?: React.ReactNode;
    /**
     * Disabled fullscreen
     */
    disabled?: boolean;
    /** Is fullscreen callback */
    onFullscreen?: (isFullscreen: boolean) => void;
}

/**
 * Higher order component to fullscreen
 */
const FullscreenModal: React.FC<FullscreenModalProps> = props => {
    const { children, disabled, onFullscreen } = props;

    const { matchTablet } = useTheme();

    const [isFullscreen, setIsFullscreen] = useState(false);

    const iconSx = useMemo((): SxProps => {
        return { position: 'absolute', top: '16px', right: '16px' };
    }, []);

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
    if (matchTablet || disabled) {
        return children;
    }

    if (isFullscreen) {
        return (
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
                    <IconButton size="small">
                        <FullscreenExitIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </Box>
            </Modal>
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
