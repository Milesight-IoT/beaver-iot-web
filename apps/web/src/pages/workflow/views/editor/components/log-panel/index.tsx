import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Stack, IconButton, Button, CircularProgress } from '@mui/material';
import { Panel, useReactFlow } from '@xyflow/react';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { merge, isEmpty } from 'lodash-es';
import { genRandomString } from '@milesight/shared/src/utils/tools';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { CloseIcon, PlayArrowIcon, toast } from '@milesight/shared/src/components';
import { CodeEditor, Empty } from '@/components';
import { ActionLog } from '@/pages/workflow/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import useWorkflow from '../../hooks/useWorkflow';
import useValidate from '../../hooks/useValidate';
import useFlowStore from '../../store';
import { type DesignMode } from '../../typings';
import './style.less';

export interface LogPanelProps {
    designMode?: DesignMode;
}

/**
 * Log Detail Panel
 */
const LogPanel: React.FC<LogPanelProps> = ({ designMode }) => {
    const { getIntlText } = useI18n();
    const { getNodes, getEdges, toObject } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const {
        openLogPanel,
        logPanelMode,
        logDetail,
        logDetailLoading,
        addTestLog,
        setOpenLogPanel,
        setLogDetail,
        setLogDetailLoading,
        setNodesDataValidResult,
    } = useFlowStore(
        useStoreShallow([
            'openLogPanel',
            'logPanelMode',
            'logDetail',
            'logDetailLoading',
            'addTestLog',
            'setOpenLogPanel',
            'setLogDetail',
            'setLogDetailLoading',
            'setNodesDataValidResult',
        ]),
    );
    const { updateNodesStatus, checkWorkflowValid } = useWorkflow();
    const title = useMemo(() => {
        switch (logPanelMode) {
            case 'testRun':
                return getIntlText('workflow.editor.log_panel_title_test_run');
            case 'runLog':
                return getIntlText('workflow.editor.log_title_run');
            case 'testLog':
                return getIntlText('workflow.editor.log_title_test');
            case 'feVerify':
                return getIntlText('workflow.editor.log_panel_title_verification_result');
            default:
                return '';
        }
    }, [logPanelMode, getIntlText]);
    const isTestRunMode = logPanelMode === 'testRun';
    const isAdvanceMode = designMode === 'advanced';

    const handleClose = useCallback(() => {
        setOpenLogPanel(false);
        setEntryInput('');
        setLogDetail(undefined);
        setLogDetailLoading(false);
        updateNodesStatus(null);
    }, [setLogDetail, setLogDetailLoading, setOpenLogPanel, updateNodesStatus]);

    // ---------- Run Test ----------
    const { checkNodesId, checkNodesType, checkNodesData, checkEdgesId, checkEdgesType } =
        useValidate();
    const [entryInput, setEntryInput] = useState('');
    const hasInput = useMemo(() => {
        if (!openLogPanel || !isTestRunMode) return false;
        const nodes = getNodes();

        return !!nodes.find(({ type }) => type === 'trigger' || type === 'listener');
    }, [openLogPanel, isTestRunMode, getNodes]);

    const genDemoData = useCallback(() => {
        if (!openLogPanel || !isTestRunMode) return;
        const nodes = getNodes();
        const entryNode = nodes.find(({ type }) => type === 'trigger' || type === 'listener');
        const { parameters } = entryNode?.data || {};
        const result: Record<string, any> = {};

        switch (entryNode?.type) {
            case 'trigger': {
                const configs = parameters?.entityConfigs as NonNullable<
                    TriggerNodeDataType['parameters']
                >['entityConfigs'];

                if (!configs?.length) return result;
                configs.forEach(({ name, type }) => {
                    if (!name) return;
                    let value: any = genRandomString(8, { lowerCase: true });

                    switch (type) {
                        case 'BOOLEAN': {
                            value = Math.random() > 0.5;
                            break;
                        }
                        case 'LONG':
                        case 'DOUBLE': {
                            value = Math.floor(Math.random() * 100);
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                    result[name] = value;
                });
                break;
            }
            case 'listener': {
                const inputArgs = parameters?.entities;

                if (!inputArgs) return result;
                inputArgs.forEach((key: string) => {
                    result[key] = genRandomString(8, { lowerCase: true });
                });
                break;
            }
            default: {
                break;
            }
        }

        return result;
    }, [openLogPanel, isTestRunMode, getNodes]);

    const { run: runFlowTest } = useRequest(
        async (value?: string) => {
            if (!openLogPanel || !isTestRunMode) return;

            // workflow verification
            const nodes = getNodes();
            const edges = getEdges();
            if (!checkWorkflowValid(nodes, edges)) return;

            const edgesCheckResult = merge(
                checkEdgesId(edges, nodes, { validateFirst: true }),
                checkEdgesType(edges, nodes, { validateFirst: true }),
            );
            // console.log({ edgesCheckResult });
            if (!isEmpty(edgesCheckResult)) return;

            const nodesCheckResult = merge(
                checkNodesId(nodes, { validateFirst: isAdvanceMode }),
                checkNodesType(nodes, { validateFirst: isAdvanceMode }),
                checkNodesData(nodes, { validateFirst: isAdvanceMode }),
            );
            // console.log({ nodesCheckResult });
            if (!isEmpty(nodesCheckResult)) {
                if (isAdvanceMode) return;
                const statusData = Object.entries(nodesCheckResult).reduce(
                    (acc, [id, item]) => {
                        acc[id] = item.status;
                        return acc;
                    },
                    {} as NonNullable<Parameters<typeof updateNodesStatus>[0]>,
                );

                setNodesDataValidResult(nodesCheckResult, logPanelMode);
                updateNodesStatus(statusData);
                return;
            }

            setLogDetailLoading(true);

            let input: Record<string, any>;
            try {
                input = !value ? undefined : JSON.parse(value || '{}');
            } catch (e) {
                toast.error({ content: getIntlText('common.message.json_format_error') });
                return;
            }
            const designData = toObject();
            const [error, resp] = await awaitWrap(
                workflowAPI.testFlow({ input, design_data: JSON.stringify(designData) }),
            );
            const data = getResponseData(resp);
            setLogDetailLoading(false);

            if (error || !isRequestSuccess(resp) || !data) return;
            const nodeStatus =
                data.trace_infos.reduce(
                    (result: Record<string, WorkflowNodeStatus>, { node_id: nodeId, status }) => {
                        result[nodeId] = status;
                        return result;
                    },
                    {},
                ) || null;

            addTestLog({ id: resp.data.request_id, flow_data: toObject(), ...data });
            setLogDetail({ traceInfos: data.trace_infos });
            updateNodesStatus(nodeStatus);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [openLogPanel, logPanelMode, isTestRunMode, entryInput, toObject],
        },
    );

    // Auto run flow test when there is not trigger node in workflow
    useEffect(() => {
        if (!openLogPanel || !isTestRunMode) return;
        if (hasInput) {
            setEntryInput(JSON.stringify(genDemoData(), null, 2));
            return;
        }

        setEntryInput('');
        runFlowTest();
    }, [openLogPanel, isTestRunMode, hasInput, genDemoData, runFlowTest]);

    // Clear Loading Status when panel mode change
    useEffect(() => {
        setLogDetailLoading(false);
    }, [logPanelMode, setLogDetailLoading]);

    return (
        <Panel
            position="top-right"
            className={cls('ms-workflow-panel-log-root', {
                hidden: !openLogPanel,
                loading: logDetailLoading,
            })}
        >
            <div className="ms-workflow-panel-log">
                <div className="ms-workflow-panel-config-header">
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flex: 1, width: 0, alignItems: 'center' }}
                    >
                        <span className="title">{title}</span>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </div>
                <div className="ms-workflow-panel-log-body">
                    {hasInput && (
                        <div className="input-area">
                            <CodeEditor
                                editorLang="json"
                                title={getIntlText('common.label.input')}
                                value={entryInput}
                                onChange={setEntryInput}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={
                                    !logDetailLoading ? (
                                        <PlayArrowIcon />
                                    ) : (
                                        <CircularProgress size={16} />
                                    )
                                }
                                disabled={logDetailLoading}
                                onClick={() => runFlowTest(entryInput)}
                            >
                                {getIntlText('common.label.run')}
                            </Button>
                        </div>
                    )}
                    {logDetail?.traceInfos?.length ? (
                        <div className="log-detail-area">
                            <ActionLog
                                traceData={logDetail.traceInfos}
                                workflowData={logDetail.flowData || toObject()}
                            />
                        </div>
                    ) : (
                        !hasInput && (
                            <div className="empty-area">
                                <Empty size="small" />
                            </div>
                        )
                    )}
                </div>
                {logDetailLoading && <CircularProgress />}
            </div>
        </Panel>
    );
};

export default React.memo(LogPanel);
