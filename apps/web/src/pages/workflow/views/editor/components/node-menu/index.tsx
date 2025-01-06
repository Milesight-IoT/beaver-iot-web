import { useState, useMemo, useLayoutEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Menu, MenuItem, type MenuProps } from '@mui/material';
import { useDebounceFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    nodeCategoryConfigs,
    basicNodeConfigs,
    type NodeConfigItemType,
} from '@/pages/workflow/config';
import useInteractions, { type AddNodeClosestPayloadParam } from '../../hooks/useInteractions';
import './style.less';

interface Props extends MenuProps, AddNodeClosestPayloadParam {
    /**
     * Menu Item click callback
     */
    onItemClick?: (nodeType: WorkflowNodeType) => void;
}

/**
 * Node Menu
 */
const NodeMenu = ({
    prevNodeId,
    prevNodeSourceHandle,
    nextNodeId,
    nextNodeTargetHandle,
    open,
    onItemClick,
    onClose,
    ...menuProps
}: Props) => {
    const { getIntlText } = useI18n();
    const menuOptions = useMemo(() => {
        const result: Partial<
            Record<
                WorkflowNodeCategoryType,
                (NodeConfigItemType & {
                    nodeName: string;
                    categoryName: string;
                })[]
            >
        > = {};

        Object.values(basicNodeConfigs).forEach(item => {
            const { category, labelIntlKey } = item;
            const cateConfig = nodeCategoryConfigs[category];

            if (!category || category === 'entry') return;
            result[category] = result[category] || [];
            result[category].push({
                ...item,
                nodeName: getIntlText(labelIntlKey),
                categoryName: getIntlText(cateConfig.labelIntlKey),
            });
        });

        return result;
    }, [getIntlText]);

    // ---------- Menu Open ----------
    const [innerOpen, setInnerOpen] = useState(false);
    const handleInnerClose: MenuProps['onClose'] = (e, reason) => {
        setInnerOpen(false);
        onClose?.(e, reason);
        // @ts-ignore
        e.stopPropagation?.();
    };

    // Sync open state from parent component
    useLayoutEffect(() => setInnerOpen(!!open), [open]);

    // ---------- Menu Item Click ----------
    const { screenToFlowPosition } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const { addNode } = useInteractions();
    const { run: handleClick } = useDebounceFn(
        (e: React.MouseEvent<HTMLLIElement, MouseEvent>, type: WorkflowNodeType) => {
            let position: { x: number; y: number } | undefined;
            if (!prevNodeId && !nextNodeId) {
                position = screenToFlowPosition({ x: e.clientX - 20, y: e.clientY - 20 });
            }

            addNode(
                { nodeType: type, position },
                { prevNodeId, prevNodeSourceHandle, nextNodeId, nextNodeTargetHandle },
            );
            onItemClick?.(type);
            handleInnerClose({}, 'backdropClick');
        },
        {
            wait: 300,
        },
    );

    return (
        <Menu
            className="ms-workflow-node-menu"
            anchorOrigin={{
                vertical: 'center',
                horizontal: 24,
            }}
            transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
            }}
            slotProps={{
                paper: { elevation: 0 },
            }}
            {...menuProps}
            open={innerOpen}
            onClose={handleInnerClose}
        >
            {Object.entries(menuOptions).map(([category, menus]) => {
                const categoryName = menus[0]?.categoryName;
                const children = [
                    <MenuItem disabled key={category}>
                        {categoryName}
                    </MenuItem>,
                ];

                children.push(
                    ...menus.map(menu => (
                        <MenuItem
                            key={menu.type}
                            onClick={e => {
                                e.stopPropagation();
                                handleClick(e, menu.type);
                            }}
                        >
                            <span className="icon" style={{ backgroundColor: menu.iconBgColor }}>
                                {menu.icon}
                            </span>
                            <span className="title">{menu.nodeName}</span>
                        </MenuItem>
                    )),
                );

                return children;
            })}
        </Menu>
    );
};

export default NodeMenu;
