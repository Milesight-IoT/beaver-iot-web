import React, { Fragment, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReactFlow, Position, type NodeProps } from '@xyflow/react';
import cls from 'classnames';
import { useDebounceEffect } from 'ahooks';
import { Menu, MenuItem } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { CheckCircleIcon, ErrorIcon, LoopIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import useFlowStore from '../../store';
import Handle from '../handle';
import './style.less';

export type NodeContainerProps = {
    /**
     * Node Type
     */
    type: WorkflowNodeType;

    /**
     * Node title i18n key
     */
    title: string;

    /**
     * Node Icon
     */
    icon: React.ReactNode;

    /**
     * Node Icon Background Color
     */
    iconBgColor: string;

    /**
     * Node Handles
     */
    handles?: React.ReactNode[];

    /**
     * Node Props
     */
    nodeProps: NodeProps<WorkflowNode>;

    /**
     * Custom Node Children
     */
    children?: React.ReactNode;
};

/**
 * Node Status Map
 */
const statusMap: Record<
    WorkflowNodeStatus | 'LOADING',
    {
        icon: React.ReactNode;
    }
> = {
    ERROR: {
        icon: <ErrorIcon />,
    },
    SUCCESS: {
        icon: <CheckCircleIcon />,
    },
    LOADING: {
        icon: <LoopIcon />,
    },
};

const entryNodeTypes = Object.values(basicNodeConfigs)
    .filter(item => item.category === 'entry')
    .map(item => item.type);

/**
 * Common Node Container
 */
const NodeContainer: React.FC<NodeContainerProps> = ({
    type,
    title,
    icon,
    iconBgColor,
    nodeProps,
    handles = [
        <Handle type="target" position={Position.Left} nodeProps={nodeProps} />,
        <Handle type="source" position={Position.Right} nodeProps={nodeProps} />,
    ],
    children,
}) => {
    const { getIntlText } = useI18n();
    const [finalProps, setFinalProps] = useState(nodeProps);
    const status = finalProps?.data?.$status;
    const nodeName = finalProps?.data?.nodeName;

    useDebounceEffect(
        () => {
            setFinalProps(nodeProps);
        },
        [nodeProps],
        { wait: 300 },
    );

    // ---------- ContextMenu ----------
    const [searchParams] = useSearchParams();
    const isEditing = !!searchParams.get('wid');
    const isLogMode = useFlowStore(state => state.isLogMode());
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();
    const nodeId = finalProps?.id;
    const nodeType = finalProps?.type as WorkflowNodeType;
    const isEntryNode = basicNodeConfigs[nodeType]?.category === 'entry';

    /**
     * Collection of modifiable node menus
     *
     * Note: The entry node can not be deleted.
     */
    const entryNodeConfigs = useMemo(() => {
        const result = Object.values(basicNodeConfigs).filter(item => {
            return item.category === 'entry' && item.type !== nodeType;
        });

        return result;
    }, [nodeType]);

    /**
     * Set Context Menu Position
     */
    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();

        if (!menuItems.length || isLogMode) {
            setContextMenu(null);
            return;
        }

        setContextMenu(
            contextMenu === null
                ? {
                      mouseX: event.clientX + 2,
                      mouseY: event.clientY - 6,
                  }
                : null,
        );
    };

    /**
     * Menu Item click callback
     */
    const { updateNode, deleteElements } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const nodeConfigs = useFlowStore(state => state.nodeConfigs);
    const handleMenuItemClick = useCallback(
        async (
            e: React.MouseEvent<HTMLLIElement, MouseEvent>,
            {
                type,
                targetNodeType,
            }: {
                type: 'change' | 'delete';
                targetNodeType?: WorkflowNodeType;
            },
        ) => {
            e.stopPropagation();
            setAnchorEl(null);
            setContextMenu(null);

            switch (type) {
                case 'change': {
                    if (!targetNodeType) return;
                    const nodeConfig = nodeConfigs[targetNodeType];
                    updateNode(nodeId, {
                        type: targetNodeType,
                        componentName: nodeConfig.componentName,
                        data: {},
                    });
                    break;
                }
                case 'delete': {
                    await deleteElements({ nodes: [{ id: nodeId }] });
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [nodeId, nodeConfigs, updateNode, deleteElements],
    );

    const menuItems = useMemo(() => {
        const result: React.ReactNode[] = [];

        if (isEntryNode && !isEditing) {
            result.push(
                <MenuItem
                    onClick={e => {
                        e.stopPropagation();
                        setAnchorEl(e.currentTarget);
                    }}
                >
                    {getIntlText('workflow.context_menu.title_change_node')}
                </MenuItem>,
            );
        }

        if (!entryNodeTypes.includes(nodeType)) {
            result.push(
                <MenuItem onClick={e => handleMenuItemClick(e, { type: 'delete' })}>
                    {getIntlText('common.label.delete')}
                </MenuItem>,
            );
        }

        return result;
    }, [isEditing, isEntryNode, nodeType, getIntlText, handleMenuItemClick]);

    return (
        <>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {handles?.map((handle, index) => <Fragment key={index}>{handle}</Fragment>)}
            <div
                className={cls('ms-workflow-node', `ms-workflow-node-${type}`, {
                    [status?.toLocaleLowerCase() || '']: status,
                })}
                onContextMenu={handleContextMenu}
            >
                <Menu
                    className="ms-workflow-node-contextmenu"
                    open={contextMenu !== null}
                    onClose={e => {
                        // @ts-ignore
                        e.stopPropagation?.();
                        setContextMenu(null);
                    }}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    {isEntryNode && (
                        <MenuItem
                            onClick={e => {
                                e.stopPropagation();
                                setAnchorEl(e.currentTarget);
                            }}
                        >
                            {getIntlText('workflow.context_menu.title_change_node')}
                        </MenuItem>
                    )}
                    {!entryNodeTypes.includes(nodeProps.type as WorkflowNodeType) && (
                        <MenuItem onClick={e => handleMenuItemClick(e, { type: 'delete' })}>
                            {getIntlText('common.label.delete')}
                        </MenuItem>
                    )}
                </Menu>
                <Menu
                    className="ms-workflow-node-contextmenu-sub"
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    onClose={e => {
                        // @ts-ignore
                        e.stopPropagation?.();
                        setAnchorEl(null);
                        setContextMenu(null);
                    }}
                >
                    {entryNodeConfigs.map(node => (
                        <MenuItem
                            key={node.type}
                            onClick={e =>
                                handleMenuItemClick(e, {
                                    type: 'change',
                                    targetNodeType: node.type,
                                })
                            }
                        >
                            <span className="icon" style={{ backgroundColor: node.iconBgColor }}>
                                {node.icon}
                            </span>
                            <span className="title">{getIntlText(node.labelIntlKey)}</span>
                        </MenuItem>
                    ))}
                </Menu>
                <div className="ms-workflow-node-header">
                    <span
                        className="ms-workflow-node-icon"
                        style={{ backgroundColor: iconBgColor }}
                    >
                        {icon}
                    </span>
                    <Tooltip
                        autoEllipsis
                        className="ms-workflow-node-title"
                        title={nodeName || title}
                    />
                    {!!status && (
                        <span
                            className={cls('ms-workflow-node-status', {
                                [status?.toLocaleLowerCase()]: status,
                            })}
                        >
                            {statusMap[status].icon}
                        </span>
                    )}
                </div>
                {children && <div className="ms-workflow-node-body">{children}</div>}
            </div>
        </>
    );
};

export default React.memo(NodeContainer);
