import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import cls from 'classnames';
import { useDebounceFn } from 'ahooks';
import {
    Handle as XHandle,
    useEdges,
    useReactFlow,
    type HandleProps,
    type NodeProps,
} from '@xyflow/react';
import { Stack } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { AddCircleIcon } from '@milesight/shared/src/components';
import NodeMenu from '../node-menu';
import useFlowStore from '../../store';
import './style.less';

export interface Props extends HandleProps {
    /**
     * Node Props
     */
    nodeProps: NodeProps<WorkflowNode>;
}

/**
 * Custom Handle Component
 */
const Handle = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & Props>(
    ({ nodeProps, className, ...props }, ref) => {
        const { getIntlHtml } = useI18n();
        const isLogMode = useFlowStore(state => state.isLogMode());
        const edges = useEdges();
        const isTargetHandle = props.type === 'target';
        const targetAddEnabled = edges.every(edge => edge.target !== nodeProps.id);

        // ---------- Handle Tooltip Open ----------
        const [originNodeZIndex] = useState(nodeProps.zIndex);
        const { updateNode } = useReactFlow();
        const [showTooltip, setShowTooltip] = useState(false);
        const { run: handleMouseEnter, cancel: cancelHandleMouseEnter } = useDebounceFn(
            () => {
                if (isLogMode || (isTargetHandle && !targetAddEnabled)) return;
                setShowTooltip(true);
                // Increase the zIndex of the node to make the tooltip appear on top of other nodes
                updateNode(nodeProps.id, { zIndex: 1 });
            },
            { wait: 500 },
        );

        // ---------- Handle Click Callback ----------
        const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
        const handleClick = useCallback(
            (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                if (isLogMode || (isTargetHandle && !targetAddEnabled)) return;
                setAnchorEl(e.currentTarget);
                e.stopPropagation();
            },
            [isLogMode, isTargetHandle, targetAddEnabled],
        );

        const closestNodeProps = useMemo(() => {
            return props.type === 'target'
                ? {
                      nextNodeId: nodeProps.id,
                      nextNodeTargetHandle: props.id,
                  }
                : {
                      prevNodeId: nodeProps.id,
                      prevNodeSourceHandle: props.id,
                  };
        }, [props, nodeProps]);

        return (
            <>
                <XHandle
                    {...props}
                    ref={ref}
                    className={cls('ms-workflow-handle', className, {
                        addable: !isLogMode,
                        'target-addable': props.type === 'target' && targetAddEnabled && !isLogMode,
                        'is-menu-open': !!anchorEl,
                    })}
                    onClick={handleClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => {
                        setShowTooltip(false);
                        cancelHandleMouseEnter();
                        updateNode(nodeProps.id, { zIndex: originNodeZIndex });
                    }}
                >
                    {/* Use Custom Tooltip, resolve the issue of Edge connect failure when Mui Tooltip component is enabled */}
                    <span
                        className={cls('ms-workflow-handle-tooltip', {
                            hidden: !showTooltip || !!anchorEl,
                        })}
                    >
                        {getIntlHtml('workflow.label.handle_tooltip')}
                    </span>
                    <Stack sx={{ pointerEvents: 'none' }}>
                        <AddCircleIcon />
                    </Stack>
                </XHandle>
                <NodeMenu
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    {...closestNodeProps}
                    onClose={() => setAnchorEl(null)}
                />
            </>
        );
    },
);

export default Handle;
