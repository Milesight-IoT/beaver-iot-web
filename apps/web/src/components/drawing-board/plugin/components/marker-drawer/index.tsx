import React, { useContext, useState, useEffect, useCallback } from 'react';
import { isEmpty } from 'lodash-es';
import { Drawer, Box, IconButton } from '@mui/material';

import { CloseIcon } from '@milesight/shared/src/components';

import { DrawingBoardContext } from '@/components/drawing-board/context';
import useControlPanelStore from '../../store';
import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';

import './style.less';

export interface MarkerDrawerProps {
    label?: React.ReactNode;
}

/**
 * Toilet image marker drawer component
 */
const MarkerDrawer: React.FC<MarkerDrawerProps> = () => {
    const { formData, updateFormData } = useControlPanelStore();
    const drawingBoardContext = useContext(DrawingBoardContext);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const markerExtraInfos = formData?.markerExtraInfos || [];
        if (!Array.isArray(markerExtraInfos) || isEmpty(markerExtraInfos)) {
            return;
        }

        const hasActiveMarker = (markerExtraInfos as MarkerExtraInfoProps[])?.some(m => m.isActive);
        console.log('hasActiveMarker ? ', hasActiveMarker);

        const mountedNode = drawingBoardContext?.panelMountedRef?.current;
        if (mountedNode) {
            mountedNode.style.display = hasActiveMarker ? 'block' : 'none';
        }

        setOpen(hasActiveMarker);
    }, [formData?.markerExtraInfos]);

    const handleCloseDrawer = useCallback(() => {
        let newMarkerExtraInfos: MarkerExtraInfoProps[] = formData?.markerExtraInfos || [];
        if (!Array.isArray(newMarkerExtraInfos) || isEmpty(newMarkerExtraInfos)) {
            newMarkerExtraInfos = [];
        }

        /**
         * Set all marker extra info to inactive
         */
        newMarkerExtraInfos = newMarkerExtraInfos.map(item => ({
            ...item,
            isActive: false,
        }));

        updateFormData({
            markerExtraInfos: newMarkerExtraInfos,
        });
    }, [formData?.markerExtraInfos, updateFormData]);

    return drawingBoardContext?.panelMountedRef?.current ? (
        <Drawer
            anchor="bottom"
            open={open}
            ModalProps={{
                container: drawingBoardContext.panelMountedRef.current,
                sx: {
                    position: 'absolute',
                    '.MuiPaper-root.MuiDrawer-paper': {
                        position: 'absolute',
                        marginBottom: 0,
                    },
                },
            }}
            transitionDuration={0}
            slotProps={{
                backdrop: {
                    sx: {
                        position: 'absolute',
                    },
                },
            }}
        >
            <Box className="toi-marker-drawer">
                <Box className="header">
                    <Box className="title">A008</Box>
                    <IconButton
                        sx={{
                            width: '36px',
                            height: '36px',
                            color: 'text.secondary',
                            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                color: 'text.secondary',
                            },
                            '&.MuiIconButton-root:hover': {
                                backgroundColor: 'var(--hover-background-1)',
                                borderRadius: '50%',
                            },
                        }}
                        onClick={handleCloseDrawer}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {JSON.stringify(formData?.markerExtraInfos)}
            </Box>
        </Drawer>
    ) : null;
};

export default React.memo(MarkerDrawer);
