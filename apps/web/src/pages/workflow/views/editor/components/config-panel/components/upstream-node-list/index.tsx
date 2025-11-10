import React, { useMemo } from 'react';
import { useControllableValue } from 'ahooks';
import { cloneDeep } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { MenuList, MenuItem, ListSubheader } from '@mui/material';
import { Tooltip, Empty } from '@/components';
import { type FlattenNodeParamType } from '@/pages/workflow/views/editor/typings';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import './style.less';

export interface UpstreamNodeListProps {
    /**
     * Filter function to filter every upstream nodes
     */
    filter?: (data: FlattenNodeParamType) => boolean;
    value?: FlattenNodeParamType;
    onChange: (value: FlattenNodeParamType) => void;
}

/**
 * Upstream node list
 */
const UpstreamNodeList: React.FC<UpstreamNodeListProps> = ({ filter, ...props }) => {
    const { getUpstreamNodeParams } = useWorkflow();
    const [upstreamNodes, flattenUpstreamNodes] = getUpstreamNodeParams();
    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue<FlattenNodeParamType>(props);

    const renderedUpstreamNodes = useMemo(() => {
        const nodes = cloneDeep(upstreamNodes);

        if (filter) {
            nodes?.forEach(node => {
                const outputs = node.outputs?.filter(output =>
                    filter({
                        ...node,
                        valueKey: output.key,
                        valueOriginKey: output.originKey,
                        valueName: output.name,
                        valueType: output.type,
                        valueTypeLabel: output.typeLabel,
                        enums: output.enums,
                    }),
                );

                node.outputs = outputs;
            });
        }

        return nodes?.reduce((acc, node) => {
            if (!node.outputs?.length) return acc;

            acc.push(
                <ListSubheader key={node.nodeId} className="ms-upstream-node-list-option-groupname">
                    <Tooltip
                        autoEllipsis
                        title={`${node.nodeName || node.nodeId} (${node.nodeLabel})`}
                    />
                </ListSubheader>,
            );

            node.outputs.forEach(output => {
                acc.push(
                    <MenuItem
                        className="ms-upstream-node-list-option"
                        key={output.key}
                        selected={node.nodeId === state?.nodeId && output.key === state?.valueKey}
                        onClick={() => {
                            const node = flattenUpstreamNodes?.find(r => r.valueKey === output.key);
                            if (node) setState(node);
                        }}
                    >
                        <div className="ms-upstream-node-list-item">
                            <Tooltip autoEllipsis className="name" title={output.name} />
                            {output.typeLabel && <span className="type">{output.typeLabel}</span>}
                        </div>
                    </MenuItem>,
                );
            });
            return acc;
        }, [] as React.ReactNode[]);
    }, [state, upstreamNodes, flattenUpstreamNodes, filter, setState]);

    return renderedUpstreamNodes?.length ? (
        <MenuList>{renderedUpstreamNodes}</MenuList>
    ) : (
        <Empty
            className="ms-upstream-node-list__empty"
            size="small"
            type="nodata"
            text={getIntlText('common.label.empty')}
        />
    );
};

export default UpstreamNodeList;
