import React, { useState, useCallback } from 'react';
import { Panel, useNodes, useReactFlow, useViewport } from '@xyflow/react';
import { Stack, Paper, ButtonGroup, Button } from '@mui/material';
import cls from 'classnames';
import {
    ZoomInIcon,
    ZoomOutIcon,
    MyLocationIcon,
    AddCircleIcon,
    PointerIcon,
    BackHandOutlinedIcon,
} from '@milesight/shared/src/components';
import NodeMenu from '../node-menu';
import { MAX_PRETTY_ZOOM } from '../../constants';
import type { MoveMode } from '../../typings';
import './style.less';

export interface ControlsProps {
    /**
     * Minimum zoom
     */
    minZoom?: number;

    /**
     * Maximum zoom
     */
    maxZoom?: number;

    /**
     * Whether disable add button
     */
    addable?: boolean;

    /**
     * Current edit mode
     */
    moveMode: MoveMode;

    /**
     * Move mode change callback
     */
    onMoveModeChange: (mode: MoveMode) => void;
}

/**
 * Workflow Editor Controls
 */
const Controls: React.FC<ControlsProps> = ({
    minZoom,
    maxZoom,
    addable = true,
    moveMode,
    onMoveModeChange,
}) => {
    const nodes = useNodes();
    const { zoom } = useViewport();
    const { zoomIn, zoomOut, fitView, getNodes, setNodes, getEdges, setEdges } = useReactFlow<
        WorkflowNode,
        WorkflowEdge
    >();

    // ---------- Add Button Click Callback ----------
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEl(e.currentTarget);
        e.stopPropagation();
    }, []);

    // ---------- Edit Mode Change ----------
    const isPanMode = moveMode === 'hand';
    const handleEditModeChange = useCallback(
        (mode: MoveMode) => {
            onMoveModeChange(mode);

            if (mode === 'pointer') return;
            const nodes = getNodes();
            const edges = getEdges();
            const newNodes = nodes.map(node => ({
                ...node,
                selected: false,
            }));
            const newEdges = edges.map(edge => ({
                ...edge,
                selected: false,
            }));

            setNodes(newNodes);
            setEdges(newEdges);
        },
        [getNodes, setNodes, getEdges, setEdges, onMoveModeChange],
    );

    return (
        <Panel
            position="bottom-left"
            className={cls('ms-workflow-controls-root', { hidden: !nodes.length })}
        >
            <Stack direction="row" spacing={1}>
                <Paper elevation={0}>
                    <ButtonGroup variant="text">
                        <Button disabled={!!minZoom && minZoom === zoom} onClick={() => zoomOut()}>
                            <ZoomOutIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Button disabled={!!maxZoom && maxZoom === zoom} onClick={() => zoomIn()}>
                            <ZoomInIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Button
                            onClick={() => fitView({ maxZoom: MAX_PRETTY_ZOOM, duration: 300 })}
                        >
                            <MyLocationIcon sx={{ fontSize: 20 }} />
                        </Button>
                    </ButtonGroup>
                </Paper>
                <Paper elevation={0}>
                    <ButtonGroup variant="text">
                        <Button
                            className="btn-add"
                            disabled={!addable}
                            sx={{ minWidth: 'auto' }}
                            onClick={handleClick}
                        >
                            <AddCircleIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Button
                            className={cls({ active: !isPanMode })}
                            onClick={() => handleEditModeChange('pointer')}
                        >
                            <PointerIcon sx={{ fontSize: 18 }} />
                        </Button>
                        <Button
                            className={cls({ active: isPanMode })}
                            onClick={() => handleEditModeChange('hand')}
                        >
                            <BackHandOutlinedIcon sx={{ fontSize: 18 }} />
                        </Button>
                    </ButtonGroup>
                    <NodeMenu
                        anchorOrigin={{
                            vertical: -8,
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={!!anchorEl}
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                    />
                </Paper>
            </Stack>
        </Panel>
    );
};

export default React.memo(Controls);
