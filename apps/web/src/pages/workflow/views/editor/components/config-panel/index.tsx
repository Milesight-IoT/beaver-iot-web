import { useState, useCallback, useMemo } from 'react';
import {
    Panel,
    useNodes,
    useReactFlow,
    type Node,
    type ReactFlowProps,
    type UseOnSelectionChangeOptions,
} from '@xyflow/react';
import cls from 'classnames';
import { Stack, IconButton } from '@mui/material';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
// import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon } from '@milesight/shared/src/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import { useCommonFormItems, type CommonFormDataProps } from './hooks';
import { ParamInput } from './components';
import './style.less';

/**
 * Config Panel
 */
const ConfigPanel = () => {
    const { getIntlText } = useI18n();

    // ---------- Handle Node-related logic ----------
    const nodes = useNodes();
    console.log('💯 ~ ConfigPanel ~ nodes:', nodes);
    const { updateNode } = useReactFlow();
    const selectedNode = useMemo(() => {
        const selectedNodes = nodes.filter(item => item.selected);
        const node = selectedNodes?.[0];

        if (selectedNodes.length > 1 || !node || !node.selected || node.dragging) {
            return;
        }

        return node;
    }, [nodes]);
    const nodeConfig = useMemo(() => {
        if (!selectedNode) return;

        return basicNodeConfigs[selectedNode.type as WorkflowNodeType];
    }, [selectedNode]);

    // ---------- Handle Form-related logic ----------
    const { control, formState, handleSubmit, reset } = useForm<CommonFormDataProps>();
    const commonFormItems = useCommonFormItems();
    const renderOtherArguments = () => {
        if (nodeConfig?.type === 'trigger') {
            return <ParamInput />;
        }
        return <span>Other Arguments...</span>;
    };
    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root', {
                hidden: !selectedNode,
            })}
        >
            {nodeConfig?.labelIntlKey && (
                <div className="ms-workflow-panel-config">
                    <div className="ms-workflow-panel-config-header">
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                            <span
                                className="icon"
                                style={{ backgroundColor: nodeConfig.iconBgColor }}
                            >
                                {nodeConfig.icon}
                            </span>
                            <span className="title">{getIntlText(nodeConfig.labelIntlKey)}</span>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {nodeConfig.testable && (
                                <IconButton
                                    onClick={() =>
                                        console.log('execute testing or popup test panel')
                                    }
                                >
                                    <PlayArrowIcon />
                                </IconButton>
                            )}
                            <IconButton
                                onClick={() => {
                                    if (!selectedNode) return;
                                    updateNode(selectedNode.id, {
                                        selected: false,
                                    });
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </div>
                    <div className="ms-workflow-panel-config-body">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                        <div className="ms-divider-line" />
                        {renderOtherArguments()}
                    </div>
                </div>
            )}
        </Panel>
    );
};

export default ConfigPanel;
