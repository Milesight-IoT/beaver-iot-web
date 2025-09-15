import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { isEqual, isEmpty, cloneDeep } from 'lodash-es';
import { useThrottleEffect, useDebounceEffect } from 'ahooks';
import { Stack, IconButton, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, HelpIcon } from '@milesight/shared/src/components';
import { NodeAvatar } from '@/pages/workflow/components';
import { Tooltip } from '@/components';
import useFlowStore from '../../store';
import { getNodeInitialParams } from '../../helper';
import useWorkflow from '../../hooks/useWorkflow';
import useValidate from '../../hooks/useValidate';
import { DEFAULT_VALUES } from './constants';
import {
    useCommonFormItems,
    useNodeFormItems,
    useExtraRender,
    type CommonFormDataProps,
    type NodeFormDataProps,
} from './hooks';
import { MoreMenu, TestDrawer, EditableText } from './components';
import './style.less';

type FormDataProps = CommonFormDataProps & NodeFormDataProps;

interface Props {
    readonly?: boolean;
}

/**
 * Config Panel
 */
const ConfigPanel: React.FC<Props> = ({ readonly }) => {
    const { getIntlText } = useI18n();
    const { getNode, getNodes, getEdges, updateNode, updateNodeData } = useReactFlow<
        WorkflowNode,
        WorkflowEdge
    >();

    // ---------- Handle Node-related logic ----------
    const { selectedNode, nodeConfigs } = useFlowStore(
        useStoreShallow(['selectedNode', 'nodeConfigs']),
    );
    const [finalSelectedNode, setFinalSelectedNode] = useState(selectedNode);
    const openPanel = !!finalSelectedNode;
    const nodeConfig = useMemo(() => {
        if (!finalSelectedNode) return;

        return nodeConfigs[finalSelectedNode.type as WorkflowNodeType];
    }, [finalSelectedNode, nodeConfigs]);

    useDebounceEffect(
        () => {
            setFormDataReady(false);
            setFinalSelectedNode(selectedNode);
        },
        [selectedNode],
        { wait: 300 },
    );

    // ---------- Handle Form-related logic ----------
    const { clearExcessEdges } = useWorkflow();
    const { control, setValue, getValues, watch, reset } = useForm<FormDataProps>();
    const commonFormItems = useCommonFormItems();
    const nodeFormGroups = useNodeFormItems({
        nodeId: finalSelectedNode?.id,
        nodeType: finalSelectedNode?.type,
        readonly,
    });
    const [formDataReady, setFormDataReady] = useState(false);
    const fields = useMemo(() => {
        const result: string[] = [];

        commonFormItems.forEach(item => {
            result.push(item.name);
        });

        nodeFormGroups.forEach(group => {
            group.children?.forEach(item => {
                result.push(item.name);
            });
        });

        return result;
    }, [commonFormItems, nodeFormGroups]);
    const formDataArr = watch(fields);
    const [latestFormData, setLatestFormData] = useState<Record<string, any>>();

    useEffect(() => {
        setLatestFormData(data => {
            const formData = fields.reduce(
                (acc, field, index) => {
                    acc[field] = formDataArr[index];
                    return acc;
                },
                {} as Record<string, any>,
            );
            if (isEqual(formData, data)) {
                return data;
            }
            return formData;
        });
    }, [fields, formDataArr]);

    // Backfill form data
    useEffect(() => {
        if (!finalSelectedNode) {
            reset();
            clearExcessEdges();
            setFormDataReady(false);
            return;
        }
        const defaultValue = cloneDeep(DEFAULT_VALUES[finalSelectedNode.type!]);
        const { nodeName, nodeRemark, parameters } = cloneDeep(finalSelectedNode.data) || {};
        const data: Record<string, any> = { nodeName, nodeRemark, ...parameters };

        reset(defaultValue);
        Object.keys(data).forEach(key => {
            setValue(key, data[key]);
        });
        /**
         * Since node form items are rendered dynamically, `SetTimeout` is used here to
         * ensure that the initial data of current node is ready.
         */
        setTimeout(() => setFormDataReady(true), 100);
    }, [finalSelectedNode, reset, setValue, getValues, clearExcessEdges]);

    // Save node data
    useThrottleEffect(
        () => {
            if (!openPanel || !finalSelectedNode?.id || !formDataReady || !nodeConfig) return;
            const { nodeName, nodeRemark, ...formData } = latestFormData || {};
            const initialParams = getNodeInitialParams(nodeConfig);

            updateNodeData(finalSelectedNode.id, {
                nodeName,
                nodeRemark,
                parameters: { ...initialParams, ...formData },
            });
        },
        [openPanel, formDataReady, latestFormData, nodeConfig, updateNodeData],
        { wait: 50 },
    );

    // ---------- Process Extra Render ----------
    const { renderFormGroupAction, renderFormGroupContent, renderFormGroupFooter } = useExtraRender(
        { isLogMode: !!readonly },
    );
    const handleFormGroupAction = useCallback(
        (data: Record<string, any>) => {
            Object.keys(data).forEach(key => {
                setValue(key, data[key]);
            });
        },
        [setValue],
    );

    // ---------- Show Test Drawer ----------
    const { checkNodesData } = useValidate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    useEffect(() => setDrawerOpen(false), [finalSelectedNode]);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root md:d-none', {
                hidden: !finalSelectedNode,
                readonly,
            })}
        >
            <div className="ms-workflow-panel-config">
                <div className="ms-workflow-panel-config-header">
                    <div className="header-inner">
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ flex: 1, width: 0, alignItems: 'center' }}
                        >
                            <NodeAvatar
                                name={nodeConfig?.label || ''}
                                type={nodeConfig?.type}
                                icon={nodeConfig?.icon}
                                iconBgColor={nodeConfig?.iconBgColor}
                            />
                            <Controller
                                key="nodeName"
                                name="nodeName"
                                control={control}
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <EditableText
                                            className="title"
                                            value={value}
                                            onChange={onChange}
                                        />
                                    );
                                }}
                            />
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {nodeConfig?.testable && !readonly && (
                                <Tooltip title={getIntlText('workflow.editor.node_test_tip')}>
                                    <IconButton
                                        onClick={() => {
                                            if (!finalSelectedNode) return;
                                            const node = getNode(finalSelectedNode.id)!;
                                            const result = checkNodesData(getNodes(), getEdges(), {
                                                validateFirst: true,
                                                validateNodes: [node],
                                            });

                                            if (!isEmpty(result)) return;
                                            setDrawerOpen(true);
                                        }}
                                    >
                                        <PlayArrowIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <MoreMenu />
                            <Divider
                                flexItem
                                orientation="vertical"
                                sx={{ height: 20, alignSelf: 'center' }}
                            />
                            <IconButton
                                onClick={() => {
                                    if (!finalSelectedNode) return;
                                    updateNode(finalSelectedNode.id, {
                                        selected: false,
                                    });
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        </Stack>
                    </div>
                    <div className="header-remark">
                        <Controller
                            key="nodeRemark"
                            name="nodeRemark"
                            control={control}
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <EditableText
                                        className="remark"
                                        placeholder={getIntlText(
                                            'workflow.editor.input_placeholder_remark',
                                        )}
                                        value={value}
                                        onChange={onChange}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
                <div className="ms-workflow-panel-config-body ms-perfect-scrollbar">
                    {/* <div className="ms-common-form-items">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <Divider className="ms-divider" /> */}
                    <div className="ms-node-form-items">
                        {nodeFormGroups.map(
                            (
                                { groupName, groupRequired, helperText, children: formItems },
                                index,
                            ) => (
                                <div
                                    className="ms-node-form-group"
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${groupName || ''}-${index}`}
                                >
                                    <div className="ms-node-form-group-header">
                                        {!!groupName && (
                                            <div className="ms-node-form-group-title">
                                                {groupRequired && (
                                                    <span className="ms-asterisk">*</span>
                                                )}
                                                {groupName}
                                                {helperText && (
                                                    <Tooltip
                                                        enterDelay={300}
                                                        enterNextDelay={300}
                                                        title={helperText}
                                                    >
                                                        <IconButton size="small">
                                                            <HelpIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        )}
                                        <div className="ms-node-form-group-actions">
                                            {renderFormGroupAction({
                                                node: finalSelectedNode,
                                                formGroupName: groupName || '',
                                                formGroupIndex: index,
                                                onChange: handleFormGroupAction,
                                            })}
                                        </div>
                                    </div>
                                    <div className="ms-node-form-group-item">
                                        {formItems?.map(props => {
                                            const { shouldRender, ...restProps } = props;

                                            /**
                                             * Whether render current form item
                                             */
                                            if (
                                                shouldRender &&
                                                typeof shouldRender === 'function' &&
                                                !shouldRender(getValues())
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <Controller<NodeFormDataProps>
                                                    {...restProps}
                                                    key={`${restProps.name}-${groupName || ''}`}
                                                    control={control}
                                                />
                                            );
                                        })}
                                        {renderFormGroupContent({
                                            node: finalSelectedNode,
                                            formGroupName: groupName || '',
                                            formGroupIndex: index,
                                            isLastFormGroup: index === nodeFormGroups.length - 1,
                                            data: latestFormData,
                                        })}
                                    </div>
                                </div>
                            ),
                        )}
                        {renderFormGroupFooter({ node: finalSelectedNode, data: latestFormData })}
                    </div>
                </div>
                <TestDrawer
                    open={drawerOpen}
                    node={finalSelectedNode}
                    onClose={() => setDrawerOpen(false)}
                />
            </div>
        </Panel>
    );
};

export default React.memo(ConfigPanel);
