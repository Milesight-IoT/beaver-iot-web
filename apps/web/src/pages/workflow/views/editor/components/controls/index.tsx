import React, { useState, useCallback } from 'react';
import { Panel, useNodes, useReactFlow, useViewport } from '@xyflow/react';
import { Stack, Paper, ButtonGroup, Button, Tooltip } from '@mui/material';
import cls from 'classnames';
import { useKeyPress } from 'ahooks';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import {
    ZoomInIcon,
    ZoomOutIcon,
    MyLocationIcon,
    // AddCircleIcon,
    AddCircleOutlineIcon,
    PointerIcon,
    BackHandOutlinedIcon,
} from '@milesight/shared/src/components';
import NodeMenu from '../node-menu';
import { MAX_PRETTY_ZOOM } from '../../constants';
import useFlowStore from '../../store';
import type { MoveMode, DesignMode } from '../../typings';
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
     * Current design mode
     */
    designMode: DesignMode;

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
    designMode,
    onMoveModeChange,
}) => {
    const nodes = useNodes();
    const { zoom } = useViewport();
    const { zoomIn, zoomOut, fitView, getNodes, setNodes, getEdges, setEdges } = useReactFlow<
        WorkflowNode,
        WorkflowEdge
    >();
    const { getIntlHtml } = useI18n();

    // ---------- Add Button Click Callback ----------
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEl(e.currentTarget);
        e.stopPropagation();
    }, []);

    // ---------- Move Mode Change ----------
    const { selectedNode, isLogMode } = useFlowStore(
        useStoreShallow(['selectedNode', 'isLogMode']),
    );
    const isPanMode = moveMode === 'hand';
    const shortcutDisable =
        !nodes.length || !!selectedNode || designMode === 'advanced' || isLogMode();

    const handleMoveModeChange = useCallback(
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

    useKeyPress(
        'ctrl.v',
        e => {
            const { nodeName } = e.target as HTMLElement;

            if (shortcutDisable || ['input', 'textarea'].includes(nodeName.toLocaleLowerCase())) {
                return;
            }

            e.preventDefault();
            handleMoveModeChange('pointer');
        },
        { exactMatch: true },
    );

    useKeyPress(
        'ctrl.h',
        e => {
            if (shortcutDisable) return;
            e.preventDefault();
            handleMoveModeChange('hand');
        },
        { exactMatch: true },
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
                    <ButtonGroup variant="text" className="md:d-none">
                        <Button
                            className="btn-add"
                            disabled={!addable}
                            sx={{ minWidth: 'auto' }}
                            onClick={handleClick}
                        >
                            <AddCircleOutlineIcon sx={{ fontSize: 20 }} />
                        </Button>
                        <Tooltip
                            enterDelay={300}
                            enterNextDelay={300}
                            slotProps={{
                                popper: { className: 'ms-workflow-controls-tooltip-popper' },
                            }}
                            title={getIntlHtml('workflow.editor.move_mode_pointer')}
                        >
                            <Button
                                className={cls({ active: !isPanMode })}
                                onClick={() => handleMoveModeChange('pointer')}
                            >
                                <PointerIcon sx={{ fontSize: 18 }} />
                            </Button>
                        </Tooltip>
                        <Tooltip
                            enterDelay={300}
                            enterNextDelay={300}
                            slotProps={{
                                popper: { className: 'ms-workflow-controls-tooltip-popper' },
                            }}
                            title={getIntlHtml('workflow.editor.move_mode_hand')}
                        >
                            <Button
                                className={cls({ active: isPanMode })}
                                onClick={() => handleMoveModeChange('hand')}
                            >
                                <BackHandOutlinedIcon sx={{ fontSize: 18 }} />
                            </Button>
                        </Tooltip>
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
