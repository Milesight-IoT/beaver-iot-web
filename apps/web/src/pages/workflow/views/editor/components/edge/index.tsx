import React, { useState, useCallback } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    useEdges,
    useReactFlow,
    type EdgeProps,
} from '@xyflow/react';
import { Stack } from '@mui/material';
import { AddCircleIcon } from '@milesight/shared/src/components';
import NodeMenu from '../node-menu';
import useFlowStore from '../../store';
import './style.less';

/**
 * AddableEdge
 */
const AddableEdge = ({
    id,
    data,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    // selected,
    style = {},
    markerEnd,
}: EdgeProps<WorkflowEdge>) => {
    const edges = useEdges<WorkflowEdge>();
    const edge = edges.find(edge => edge.id === id);
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sourceX - 8,
        sourceY,
        sourcePosition,
        targetX: targetX + 8,
        targetY,
        targetPosition,
    });
    const isLogMode = useFlowStore(state => state.isLogMode());

    // ---------- Add Button Click Callback ----------
    const { updateEdgeData } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(e.currentTarget);
        e.stopPropagation();
    }, []);

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {data?.$hovering && !isLogMode && (
                <EdgeLabelRenderer>
                    <div
                        className="ms-workflow-edge-label"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        }}
                    >
                        <Stack onClick={handleClick}>
                            <AddCircleIcon />
                        </Stack>
                        <NodeMenu
                            open={!!anchorEl}
                            anchorEl={anchorEl}
                            prevNodeId={edge?.source}
                            prevNodeSourceHandle={edge?.sourceHandle}
                            nextNodeId={edge?.target}
                            nextNodeTargetHandle={edge?.targetHandle}
                            onClose={() => {
                                setAnchorEl(null);
                                updateEdgeData(id, { $hovering: false });
                            }}
                        />
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default React.memo(AddableEdge);
