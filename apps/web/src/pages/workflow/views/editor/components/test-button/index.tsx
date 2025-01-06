import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroup, Button, Popover, Tabs, Tab, CircularProgress } from '@mui/material';
import { useRequest } from 'ahooks';
import { useNodes } from '@xyflow/react';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { PlayArrowIcon, HistoryIcon } from '@milesight/shared/src/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { TabPanel } from '@/components';
import LogList, { type LogType, type LogListProps } from './log-list';
import useFlowStore from '../../store';
import useWorkflow from '../../hooks/useWorkflow';
import './style.less';

export type TestButtonType = 'test' | 'history';

type LogTabItem = {
    key: LogType;
    label: string;
    component: React.ReactNode;
};

interface Props {
    disabled?: boolean;
    onClick?: () => void | Promise<void>;
}

const DEFAULT_TAB_KEY: LogType = 'test';

/**
 * Test Button
 */
const TestButton: React.FC<Props> = ({ disabled }) => {
    const { getIntlText } = useI18n();
    const nodes = useNodes<WorkflowNode>();
    const [searchParams] = useSearchParams();
    const wid = searchParams.get('wid');
    const {
        runLogs,
        testLogs,
        logDetailLoading,
        setRunLogs,
        setLogPanelMode,
        setOpenLogPanel,
        setLogDetail,
        setLogDetailLoading,
    } = useFlowStore(
        useStoreShallow([
            'runLogs',
            'testLogs',
            'logDetailLoading',
            'setRunLogs',
            'setLogPanelMode',
            'setOpenLogPanel',
            'setLogDetail',
            'setLogDetailLoading',
        ]),
    );
    const { updateNodesStatus } = useWorkflow();

    // ---------- Fetch Run Log List ----------
    const { loading, run: getRunLogList } = useRequest(
        async () => {
            if (!wid) return;
            const [error, resp] = await awaitWrap(
                workflowAPI.getLogList({ id: wid, page_size: 999, page_number: 1 }),
            );

            // console.log({ error, resp });
            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);

            setRunLogs(data?.content);
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [wid],
        },
    );

    // ---------- Popover ----------
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>, type: TestButtonType) => {
        if (type === 'test') {
            setOpenLogPanel(true);
            setLogPanelMode('testRun');
            setLogDetail(undefined);
            updateNodesStatus(null);
            return;
        }

        getRunLogList();
        setTabKey(DEFAULT_TAB_KEY);
        setAnchorEl(e.currentTarget);
    };
    const handleLogItemClick = useCallback(
        async (type: LogType, record: Parameters<NonNullable<LogListProps['onSelect']>>[0]) => {
            setAnchorEl(null);
            setOpenLogPanel(true);
            updateNodesStatus(null);
            switch (type) {
                case 'test': {
                    setLogPanelMode('testLog');
                    setLogDetail({ traceInfos: record.trace_infos!, flowData: record.flow_data });
                    break;
                }
                case 'run': {
                    if (!wid) return;
                    setLogPanelMode('runLog');
                    setLogDetailLoading(true);

                    let resp;
                    try {
                        resp = await Promise.all([
                            workflowAPI.getLogDetail({ id: record.id }),
                            workflowAPI.getFlowDesign({ id: wid, version: record.version }),
                        ]);
                    } catch (e) {
                        return;
                    }
                    const [detailResp, flowResp] = resp;

                    setLogDetailLoading(false);
                    if (!isRequestSuccess(detailResp) || !isRequestSuccess(flowResp)) return;
                    const traceInfos = getResponseData(detailResp)!.trace_info;
                    const designData = getResponseData(flowResp)?.design_data;
                    const flowData: undefined | Pick<WorkflowSchema, 'nodes' | 'edges'> =
                        designData && typeof designData === 'string'
                            ? JSON.parse(designData)
                            : designData;

                    setLogDetail({ traceInfos, flowData });
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [
            wid,
            setLogDetail,
            setLogDetailLoading,
            setLogPanelMode,
            setOpenLogPanel,
            updateNodesStatus,
        ],
    );

    // ---------- Tab ----------
    const [tabKey, setTabKey] = useState<LogType>(DEFAULT_TAB_KEY);
    const tabs = useMemo(() => {
        const result: LogTabItem[] = [
            {
                key: 'test',
                label: getIntlText('workflow.editor.logs_popover_title_test'),
                component: (
                    <LogList
                        data={testLogs || []}
                        onSelect={record => handleLogItemClick('test', record)}
                    />
                ),
            },
        ];

        if (wid) {
            result.push({
                key: 'run',
                label: getIntlText('workflow.editor.logs_popover_title_run'),
                component: (
                    <LogList
                        data={runLogs || []}
                        loading={loading}
                        onSelect={record => handleLogItemClick('run', record)}
                    />
                ),
            });
        }

        return result;
    }, [wid, runLogs, testLogs, loading, getIntlText, handleLogItemClick]);

    return (
        <>
            <ButtonGroup className="ms-workflow-test-button" disabled={disabled}>
                <Button
                    variant="outlined"
                    disabled={logDetailLoading || !nodes?.length}
                    startIcon={
                        !logDetailLoading ? (
                            <PlayArrowIcon />
                        ) : (
                            <CircularProgress size={16} color="inherit" />
                        )
                    }
                    onClick={e => handleClick(e, 'test')}
                >
                    {getIntlText('common.label.test')}
                </Button>
                <Button variant="outlined" onClick={e => handleClick(e, 'history')}>
                    <HistoryIcon />
                </Button>
            </ButtonGroup>
            <Popover
                className="ms-workflow-test-popover-root"
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: -8,
                    horizontal: 'right',
                }}
            >
                <div className="ms-workflow-test-popover">
                    <div className="ms-workflow-test-popover-header">
                        <Tabs
                            className="ms-workflow-tabs"
                            value={tabKey}
                            onChange={(_, value) => setTabKey(value)}
                        >
                            {tabs.map(({ key, label }) => (
                                <Tab
                                    disableRipple
                                    key={key}
                                    value={key}
                                    title={label}
                                    label={label}
                                />
                            ))}
                        </Tabs>
                    </div>
                    <div className="ms-workflow-test-popover-body">
                        {tabs.map(({ key, component }) => (
                            <TabPanel value={tabKey} index={key} key={key}>
                                {component}
                            </TabPanel>
                        ))}
                    </div>
                </div>
            </Popover>
        </>
    );
};

export default TestButton;
