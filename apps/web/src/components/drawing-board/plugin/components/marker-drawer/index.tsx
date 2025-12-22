import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isEmpty } from 'lodash-es';
import { Drawer, Box, IconButton } from '@mui/material';

import { CloseIcon } from '@milesight/shared/src/components';

import { DrawingBoardContext } from '@/components/drawing-board/context';
import useControlPanelStore from '../../store';
import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';
import EntityForm from './EntityForm';

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

    /**
     * Get active marker extra info
     */
    const activeMarker = useMemo(() => {
        return ((formData?.markerExtraInfos || []) as MarkerExtraInfoProps[]).find(m => m.isActive);
    }, [formData?.markerExtraInfos]);

    /**
     * Update drawer open state when active marker changed
     */
    useEffect(() => {
        const markerExtraInfos = formData?.markerExtraInfos || [];
        const mountedNode = drawingBoardContext?.panelMountedRef?.current;
        if (!Array.isArray(markerExtraInfos) || isEmpty(markerExtraInfos) || !mountedNode) {
            return;
        }

        const hasActiveMarker = (markerExtraInfos as MarkerExtraInfoProps[]).some(m => m.isActive);

        /**
         * Show the drawer container when active marker exists, otherwise hide it
         */
        mountedNode.style.display = hasActiveMarker ? 'block' : 'none';

        setOpen(hasActiveMarker);
    }, [formData?.markerExtraInfos, drawingBoardContext?.panelMountedRef]);

    /**
     * Hide the drawer container when close drawer
     */
    const hiddenDrawerModal = useCallback(() => {
        const mountedNode = drawingBoardContext?.panelMountedRef?.current;
        if (mountedNode) {
            mountedNode.style.display = 'none';
        }

        setOpen(false);
    }, [drawingBoardContext?.panelMountedRef]);

    const handleCloseDrawer = useCallback(() => {
        hiddenDrawerModal();

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
            ...formData,
            markerExtraInfos: newMarkerExtraInfos,
        });
    }, [formData, updateFormData, hiddenDrawerModal]);

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
                        backgroundColor: 'transparent',
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
                    <Box className="title">{activeMarker?.toiletNumber || ''}</Box>
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

                <EntityForm
                    data={activeMarker}
                    formData={formData}
                    updateFormData={updateFormData}
                    onSuccess={hiddenDrawerModal}
                />
            </Box>
        </Drawer>
    ) : null;
};

export default React.memo(MarkerDrawer);
