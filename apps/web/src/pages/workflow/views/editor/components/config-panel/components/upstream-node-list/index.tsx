import React, { useMemo } from 'react';
import { useControllableValue } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { MenuList, MenuItem, ListSubheader } from '@mui/material';
import { Tooltip, Empty } from '@/components';
import useWorkflow, {
    type FlattenNodeParamType,
} from '@/pages/workflow/views/editor/hooks/useWorkflow';

import './style.less';

export interface UpstreamNodeListProps {
    value?: FlattenNodeParamType;
    onChange: (value: FlattenNodeParamType) => void;
}

/**
 * Upstream node list
 */
const UpstreamNodeList: React.FC<UpstreamNodeListProps> = props => {
    const { getUpstreamNodeParams } = useWorkflow();
    const [upstreamNodes, flattenUpstreamNodes] = getUpstreamNodeParams();
    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue<FlattenNodeParamType>(props);

    const renderedUpstreamNodes = useMemo(() => {
        return upstreamNodes?.reduce((acc, node) => {
            if (!node.outputs?.length) return acc;

            acc.push(
                <ListSubheader key={node.nodeId} className="ms-upstream-node-list-option-groupname">
                    {`${node.nodeName || node.nodeId} (${node.nodeLabel})`}
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
                            {output.type && <span className="type">{output.type}</span>}
                        </div>
                    </MenuItem>,
                );
            });
            return acc;
        }, [] as React.ReactNode[]);
    }, [state, upstreamNodes, flattenUpstreamNodes, setState]);

    const renderList = () => {
        if (isEmpty(upstreamNodes) || isEmpty(flattenUpstreamNodes)) {
            return (
                <Empty
                    className="ms-upstream-node-list__empty"
                    size="small"
                    type="nodata"
                    text={getIntlText('common.label.empty')}
                />
            );
        }

        return <MenuList>{renderedUpstreamNodes}</MenuList>;
    };

    return renderList();
};

export default UpstreamNodeList;
