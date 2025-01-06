import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type WorkflowAPISchema, type FlowNodeTraceInfo } from '@/services/http';
import { basicNodeConfigs } from '../../config';
import type { NodesDataValidResult } from './hooks';
import type { NodeConfigItem } from './typings';

export interface FlowStore {
    selectedNode?: WorkflowNode;

    /** Workflow Node Configs */
    nodeConfigs: Record<WorkflowNodeType, NodeConfigItem>;

    /**
     * Log Panel Mode
     *
     * @param testRun Render Test Run Panel
     * @param testLog Render Test Log Detail
     * @param runLog Render Run Log Detail
     * @param feVerify Render Frontend Verification Detail
     */
    logPanelMode?: 'testRun' | 'testLog' | 'runLog' | 'feVerify';

    /**
     * Open Log Panel
     */
    openLogPanel?: boolean;

    /**
     * Test Log List
     */
    testLogs?: (PartialOptional<
        WorkflowAPISchema['getLogList']['response']['content'][number],
        'version'
    > & {
        trace_infos?: FlowNodeTraceInfo[];
        flow_data?: Pick<WorkflowSchema, 'nodes' | 'edges'>;
    })[];

    /**
     * Run Log List
     */
    runLogs?: WorkflowAPISchema['getLogList']['response']['content'];

    logDetail?: {
        flowData?: Pick<WorkflowSchema, 'nodes' | 'edges'>;
        traceInfos: PartialOptional<FlowNodeTraceInfo, 'start_time' | 'time_cost'>[];
    };

    logDetailLoading?: boolean;

    isLogMode: () => boolean;

    setSelectedNode: (node?: FlowStore['selectedNode']) => void;

    setNodeConfigs: (nodeConfigs: WorkflowAPISchema['getFlowNodes']['response']) => void;

    setLogPanelMode: (logPanelMode: FlowStore['logPanelMode']) => void;

    setOpenLogPanel: (open: FlowStore['openLogPanel']) => void;

    setTestLogs: (testLogs: FlowStore['testLogs']) => void;
    addTestLog: (log?: NonNullable<FlowStore['testLogs']>[0]) => void;

    setRunLogs: (runLogs: FlowStore['runLogs']) => void;

    setLogDetail: (detail?: FlowStore['logDetail']) => void;

    setLogDetailLoading: (loading: FlowStore['logDetailLoading']) => void;

    setNodesDataValidResult: (
        data: NodesDataValidResult | null,
        logPanelMode?: FlowStore['logPanelMode'],
    ) => void;
}

const useFlowStore = create(
    immer<FlowStore>((set, get) => ({
        nodeConfigs: basicNodeConfigs,

        testLogs: [],

        isLogMode: () => {
            const { openLogPanel, logDetail, logPanelMode } = get();
            return !!(
                openLogPanel &&
                logDetail &&
                (logPanelMode === 'runLog' || logPanelMode === 'testLog')
            );
        },

        setSelectedNode: node => set({ selectedNode: node }),

        setNodeConfigs: nodeConfigs => {
            const configs = Object.entries(nodeConfigs).reduce((acc, [cat, configs]) => {
                const result = configs.map(config => {
                    const schema =
                        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
                    const basicConfig = Object.values(basicNodeConfigs).find(
                        item => item.componentName === config.name,
                    );

                    return {
                        type: config.name,
                        label: config.title,
                        ...basicConfig,
                        category: cat,
                        testable: schema?.component?.testable,
                        schema,
                    } as NodeConfigItem;
                });

                acc = acc.concat(result);
                return acc;
            }, [] as NodeConfigItem[]);
            const result = configs.reduce(
                (acc, config) => {
                    acc[config.type] = config;
                    return acc;
                },
                {} as FlowStore['nodeConfigs'],
            );

            set({ nodeConfigs: result });
        },
        setLogPanelMode: logPanelMode => set({ logPanelMode }),
        setOpenLogPanel: open => set({ openLogPanel: open }),
        setTestLogs: testLogs => set({ testLogs }),
        addTestLog: log => {
            set(state => {
                if (!log) return;
                const testLogs = [log, ...(state.testLogs || [])];
                return { testLogs };
            });
        },
        setRunLogs: runLogs => set({ runLogs }),
        setLogDetail: detail => set({ logDetail: detail }),
        setLogDetailLoading: loading => set({ logDetailLoading: loading }),
        setNodesDataValidResult(data, logPanelMode = 'feVerify') {
            if (!data) {
                set({ openLogPanel: false, logPanelMode: undefined, logDetail: undefined });
                return;
            }
            // console.log(data);
            const traceInfos = Object.entries(data).map(([id, { type, name, label, errMsgs }]) => {
                const result: NonNullable<FlowStore['logDetail']>['traceInfos'][0] = {
                    node_id: id,
                    node_label: label!,
                    status: 'ERROR',
                    error_message: errMsgs[0],
                };
                return result;
            });

            // console.log(logDetail);
            set({ openLogPanel: true, logPanelMode, logDetail: { traceInfos } });
        },
    })),
);

export default useFlowStore;
