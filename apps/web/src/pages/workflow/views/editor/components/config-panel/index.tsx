import React, { useMemo, useLayoutEffect, useEffect, useRef, useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { isEqual } from 'lodash-es';
import { useThrottleEffect } from 'ahooks';
import { Stack, IconButton, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, HelpIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useFlowStore from '../../store';
import {
    useCommonFormItems,
    useNodeFormItems,
    type CommonFormDataProps,
    type NodeFormDataProps,
} from './hooks';
import useConfigPanelStore from './store';
import { MoreMenu, TestDrawer } from './components';
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
    const { updateNode, updateNodeData } = useReactFlow();

    // ---------- Handle Node-related logic ----------
    const { selectedNode, nodeConfigs } = useFlowStore(
        useStoreShallow(['selectedNode', 'nodeConfigs']),
    );
    const openPanel = !!selectedNode;
    const nodeConfig = useMemo(() => {
        if (!selectedNode) return;

        return nodeConfigs[selectedNode.type as WorkflowNodeType];
    }, [selectedNode, nodeConfigs]);

    // ---------- Entity List Data Init ----------
    const getEntityList = useConfigPanelStore(state => state.getEntityList);

    useLayoutEffect(() => {
        if (!openPanel) return;
        getEntityList(undefined, true);
    }, [openPanel, getEntityList]);

    // ---------- Handle Form-related logic ----------
    const { control, setValue, watch, reset } = useForm<FormDataProps>();
    const commonFormItems = useCommonFormItems();
    const nodeFormGroups = useNodeFormItems({ nodeType: selectedNode?.type, readonly });
    const allFormData = watch();
    const preFormData = useRef<FormDataProps>();
    const formDataInit = useRef(false);
    // Use ref value to avoid unnecessary re-renders
    const latestFormData = useMemo(() => {
        if (isEqual(preFormData.current, allFormData)) {
            return preFormData.current;
        }

        preFormData.current = allFormData;
        return allFormData;
    }, [allFormData]);

    // Backfill form data
    useEffect(() => {
        if (!selectedNode) {
            reset();
            formDataInit.current = false;
            return;
        }
        const { nodeName, nodeRemark, parameters } = selectedNode.data || {};
        const data: Record<string, any> = { nodeName, nodeRemark, ...parameters };

        reset();
        /**
         * Since node form items are rendered dynamically, `SetTimeout` is used here to
         * ensure that the initial data is filled in after the rendering is complete.
         */
        setTimeout(() => {
            Object.keys(data).forEach(key => {
                setValue(key, data[key]);
            });
            formDataInit.current = true;
        }, 0);
    }, [selectedNode, reset, setValue]);

    // Save node data
    useThrottleEffect(
        () => {
            if (!openPanel || !formDataInit.current) return;
            const { nodeName, nodeRemark, ...formData } = latestFormData || {};

            // console.log({ formData });
            updateNodeData(selectedNode.id, { nodeName, nodeRemark, parameters: formData });
        },
        [openPanel, selectedNode, latestFormData, updateNodeData],
        { wait: 200 },
    );

    // ---------- Show Test Drawer ----------
    const [drawerOpen, setDrawerOpen] = useState(false);
    useEffect(() => setDrawerOpen(false), [selectedNode]);
    useEffect(() => {
        if (drawerOpen) return;
        setDrawerOpen(false);
    }, [drawerOpen]);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-config-root', {
                hidden: !selectedNode,
                readonly,
            })}
        >
            <div className="ms-workflow-panel-config">
                <div className="ms-workflow-panel-config-header">
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flex: 1, width: 0, alignItems: 'center' }}
                    >
                        <span className="icon" style={{ backgroundColor: nodeConfig?.iconBgColor }}>
                            {nodeConfig?.icon}
                        </span>
                        <Tooltip
                            autoEllipsis
                            className="title"
                            title={
                                latestFormData?.nodeName ||
                                (!nodeConfig?.labelIntlKey
                                    ? ''
                                    : getIntlText(nodeConfig?.labelIntlKey))
                            }
                        />
                        {/* {!!nodeConfig?.labelIntlKey && (
                            <span className="title">{getIntlText(nodeConfig.labelIntlKey)}</span>
                        )} */}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {nodeConfig?.testable && !readonly && (
                            <Tooltip title={getIntlText('workflow.editor.node_test_tip')}>
                                <IconButton onClick={() => setDrawerOpen(true)}>
                                    <PlayArrowIcon />
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
                    <div className="ms-common-form-items">
                        {commonFormItems.map(props => (
                            <Controller<CommonFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <Divider className="ms-divider" />
                    <div className="ms-node-form-items">
                        {nodeFormGroups.map(
                            ({ groupName, helperText, children: formItems }, index) => (
                                <div
                                    className="ms-node-form-group"
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${groupName || ''}-${index}`}
                                >
                                    {!!groupName && (
                                        <div className="ms-node-form-group-title">
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
                                    <div className="ms-node-form-group-item">
                                        {formItems?.map(props => {
                                            const { shouldRender, ...restProps } = props;

                                            /**
                                             * Whether render current form item
                                             */
                                            if (
                                                shouldRender &&
                                                typeof shouldRender === 'function' &&
                                                !shouldRender(allFormData)
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <Controller<NodeFormDataProps>
                                                    {...restProps}
                                                    key={restProps.name}
                                                    control={control}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
                <TestDrawer
                    open={drawerOpen}
                    node={selectedNode}
                    onClose={() => setDrawerOpen(false)}
                />
            </div>
        </Panel>
    );
};

export default React.memo(ConfigPanel);
