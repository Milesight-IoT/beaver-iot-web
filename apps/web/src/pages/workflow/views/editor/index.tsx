import { memo, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useRequest, useDebounceEffect } from 'ahooks';
import { merge, isEmpty, isEqual, isNil, pickBy, cloneDeep } from 'lodash-es';
import {
    ReactFlow,
    Background,
    SelectionMode,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    type NodeChange,
    type EdgeChange,
} from '@xyflow/react';
import { useI18n, useStoreShallow, usePreventLeave } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { LoadingButton, toast } from '@milesight/shared/src/components';
import { CodeEditor, useConfirm, useEntityStore } from '@/components';
import {
    workflowAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type FlowNodeTraceInfo,
    entityAPI,
} from '@/services/http';
import {
    MIN_ZOOM,
    MAX_ZOOM,
    MAX_PRETTY_ZOOM,
    FROZEN_NODE_PROPERTY_KEYS,
    DELETE_KEY_CODE,
} from './constants';
import useFlowStore from './store';
import { normalizeNodes, normalizeEdges } from './helper';
import { useNodeTypes, useInteractions, useWorkflow, useValidate } from './hooks';
import {
    Topbar,
    Controls,
    ConfigPanel,
    Edge,
    HelperLines,
    getHelperLines,
    EntryPanel,
    LogPanel,
    TestButton,
    type TopbarProps,
} from './components';
import type { DesignMode, MoveMode } from './typings';

import '@xyflow/react/dist/style.css';
import './style.less';

const edgeTypes: Record<WorkflowEdgeType, React.FC<any>> = {
    addable: Edge,
};

/**
 * Workflow Editor
 */
const WorkflowEditor = () => {
    const { getIntlText } = useI18n();
    const nodeTypes = useNodeTypes();
    const { toObject, updateNode } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);
    const { isValidConnection, checkWorkflowValid, updateNodesStatus } = useWorkflow();
    const { handleConnect, handleBeforeDelete, handleEdgeMouseEnter, handleEdgeMouseLeave } =
        useInteractions();
    const { checkNodesId, checkNodesType, checkNodesData, checkEdgesId, checkEdgesType } =
        useValidate();
    const confirm = useConfirm();
    const {
        logDetail,
        setSelectedNode,
        setOpenLogPanel,
        setNodeConfigs,
        setTestLogs,
        setLogDetail,
        setNodesDataValidResult,
    } = useFlowStore(
        useStoreShallow([
            'logDetail',
            'setSelectedNode',
            'setOpenLogPanel',
            'setNodeConfigs',
            'setTestLogs',
            'setLogDetail',
            'setNodesDataValidResult',
        ]),
    );

    // ---------- Store selected node ----------
    const selectedNode = (() => {
        const selectedNodes = nodes.filter(item => item.selected);
        const node = selectedNodes?.[0];

        if (selectedNodes.length > 1 || !node || !node.selected || node.dragging) {
            return;
        }

        return node;
    })();
    const selectedNodeId = selectedNode?.id;
    const selectedNodeType = selectedNode?.type;

    // Only the nodeId/nodeType changed, we update the selected node
    useEffect(() => {
        setSelectedNode(selectedNode);
    }, [selectedNodeId, selectedNodeType]);

    // ---------- Prevent Leave ----------
    const [isPreventLeave, setIsPreventLeave] = useState(false);
    const handleEdgesChange = useCallback(
        (changes: EdgeChange<WorkflowEdge>[]) => {
            if (changes.some(({ type }) => ['add', 'remove'].includes(type))) {
                setIsPreventLeave(true);
            }

            onEdgesChange(changes);
        },
        [onEdgesChange],
    );

    usePreventLeave({ isPreventLeave, confirm });

    // ---------- Show Helper Lines when node change ----------
    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);
    const handleNodesChange = useCallback(
        (changes: NodeChange<WorkflowNode>[]) => {
            const isPreventLeave = changes.some(change => {
                switch (change.type) {
                    case 'add':
                    case 'remove':
                    case 'position': {
                        return true;
                    }
                    case 'replace': {
                        const { id: nodeId, data: nodeData } = change.item;
                        const node = nodes.find(item => item.id === nodeId);
                        const originNodeData = node?.data || {};
                        const originData = pickBy(
                            {
                                nodeName: originNodeData.nodeName,
                                nodeRemark: originNodeData.nodeRemark,
                                ...originNodeData.parameters,
                            },
                            item => !isNil(item),
                        );
                        const currentData = pickBy(
                            {
                                nodeName: nodeData.nodeName,
                                nodeRemark: nodeData.nodeRemark,
                                ...nodeData.parameters,
                            },
                            item => !isNil(item),
                        );

                        return !isEqual(originData, currentData);
                    }
                    default: {
                        return false;
                    }
                }
            });
            if (isPreventLeave) setIsPreventLeave(true);

            // reset the helper lines (clear existing lines, if any)
            setHelperLineHorizontal(undefined);
            setHelperLineVertical(undefined);

            if (
                changes.length === 1 &&
                changes[0].type === 'position' &&
                changes[0].dragging &&
                changes[0].position
            ) {
                const helperLines = getHelperLines(changes[0], nodes || []);

                // if we have a helper line, we snap the node to the helper line position
                // this is being done by manipulating the node position inside the change object
                changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
                changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

                // if helper lines are returned, we set them so that they can be displayed
                setHelperLineHorizontal(helperLines.horizontal);
                setHelperLineVertical(helperLines.vertical);
            }

            onNodesChange(changes);
        },
        [nodes, onNodesChange],
    );

    // ---------- Fetch Nodes Config ----------
    const { loading: nodeConfigLoading } = useRequest(
        async () => {
            const [error, resp] = await awaitWrap(workflowAPI.getFlowNodes());
            const data = getResponseData(resp);

            if (error || !data || !isRequestSuccess(resp)) return;
            setNodeConfigs(data);
        },
        { debounceWait: 300 },
    );

    // ---------- Fetch Flow Data ----------
    const [searchParams] = useSearchParams();
    const wid = searchParams.get('wid');
    const version = searchParams.get('version') || '';
    const [basicData, setBasicData] = useState<TopbarProps['data']>(() => {
        if (wid) return { id: wid };
    });
    const [flowDataLoading, setFlowDataLoading] = useState<boolean>();
    const handleFlowDataChange = useCallback<NonNullable<TopbarProps['onDataChange']>>(
        (data, reason) => {
            setBasicData(data);
            if (reason === 'manual') setIsPreventLeave(true);
        },
        [],
    );

    useRequest(
        async () => {
            if (!wid) return;
            setFlowDataLoading(true);
            const [error, resp] = await awaitWrap(workflowAPI.getFlowDesign({ id: wid, version }));

            setFlowDataLoading(false);
            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp);
            const { design_data: designData, ...basicData } = data || {};
            let flowData: Pick<WorkflowSchema, 'nodes' | 'edges'>;

            // console.log(data);
            try {
                flowData = JSON.parse(designData || '{}');
            } catch (e) {
                console.warn(e);
                toast.error({ content: getIntlText('common.message.json_format_error') });
                return;
            }

            setNodes(flowData?.nodes);
            setEdges(flowData?.edges);
            setBasicData(basicData);

            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [wid, version],
        },
    );

    // ---------- Fetch Entity List ----------
    const { initEntityList } = useEntityStore(
        useStoreShallow(['status', 'entityList', 'initEntityList']),
    );

    useDebounceEffect(
        () => {
            initEntityList();
        },
        [initEntityList],
        { wait: 300 },
    );

    // ---------- Fetch Tag List ----------
    // const refreshTags = useTagSelectStore(state => state.refreshTags);

    // useDebounceEffect(
    //     () => {
    //         refreshTags(true);
    //     },
    //     [refreshTags],
    //     { wait: 300 },
    // );

    // ---------- Handle Import Data ----------
    const { state } = useLocation();
    const importedData = state?.workflowSchema as WorkflowSchema | undefined;

    useEffect(() => {
        if (wid || !importedData) return;
        const { nodes, edges, viewport } = importedData;

        setNodes(nodes);
        setEdges(edges);
    }, [wid, importedData, setNodes, setEdges]);

    // ---------- Render Log Flow Data ----------
    const [originFlowData, setOriginFlowData] = useState<
        undefined | Pick<WorkflowSchema, 'nodes' | 'edges'>
    >();
    const isLogMode = useFlowStore(state => state.isLogMode());

    useEffect(() => {
        if (!isLogMode) {
            if (originFlowData) {
                setNodes(originFlowData.nodes);
                setEdges(originFlowData.edges);
                setOriginFlowData(undefined);
            }
            return;
        }
        const { nodes, edges } = cloneDeep(logDetail?.flowData) || {};
        const traceInfos = logDetail?.traceInfos.reduce(
            (acc, item) => {
                acc[item.node_id] = item;
                return acc;
            },
            {} as Record<string, Partial<FlowNodeTraceInfo>>,
        );

        if (!nodes?.length || !edges?.length) return;

        nodes.forEach(node => {
            const traceInfo = traceInfos?.[node.id];
            if (!traceInfo) return;
            node.data = { ...node.data, $status: traceInfo.status };
        });

        if (!originFlowData) {
            const originData = originFlowData || toObject();
            setOriginFlowData({
                nodes: normalizeNodes(originData.nodes),
                edges: normalizeEdges(originData.edges),
            });
        }

        setNodes(nodes);
        setEdges(edges);
    }, [isLogMode, logDetail, setNodes, setEdges, toObject]);

    // ---------- Design Mode Change ----------
    const [designMode, setDesignMode] = useState<DesignMode>('canvas');
    const [editorFlowData, setEditorFlowData] = useState<string>();
    const handleDesignModeChange = useCallback(
        (mode: DesignMode) => {
            if (mode === 'advanced') {
                const { nodes, edges } = cloneDeep(toObject());
                const newNodes = normalizeNodes(nodes, [...FROZEN_NODE_PROPERTY_KEYS, 'measured']);
                const newEdges = normalizeEdges(edges);

                if (!nodes.length) {
                    // Allow switching when nodes is empty
                    setDesignMode(mode);
                } else if (!checkWorkflowValid(newNodes, newEdges)) {
                    return;
                }

                const selectedNode = nodes.find(node => node.selected);

                if (selectedNode) updateNode(selectedNode.id, { selected: false });
                setEditorFlowData(JSON.stringify({ nodes: newNodes, edges: newEdges }, null, 2));
            } else if (mode === 'canvas') {
                let data: Pick<WorkflowSchema, 'nodes' | 'edges'>;

                try {
                    data = JSON.parse(editorFlowData || '{}');
                } catch (e) {
                    console.warn(e);
                    toast.error({ content: getIntlText('common.message.json_format_error') });
                    return;
                }
                const { nodes, edges } = data;

                // Allow switching when nodes is empty
                if (!nodes?.length) {
                    setDesignMode(mode);
                    return;
                }
                if (!checkWorkflowValid(nodes, edges)) return;
                if (
                    checkNodesId(nodes, { validateFirst: true }) ||
                    checkNodesType(nodes, { validateFirst: true }) ||
                    checkEdgesId(edges, nodes, { validateFirst: true }) ||
                    checkEdgesType(edges, nodes, { validateFirst: true })
                ) {
                    return;
                }

                setNodes(nodes);
                setEdges(edges);
                setOpenLogPanel(false);
            }

            setDesignMode(mode);
        },
        [
            editorFlowData,
            checkWorkflowValid,
            toObject,
            checkNodesId,
            checkNodesType,
            checkEdgesId,
            checkEdgesType,
            setNodes,
            setEdges,
            updateNode,
            setOpenLogPanel,
            getIntlText,
        ],
    );
    const handleBeforeBack = () => {
        const selectedNode = nodes.find(node => node.selected);

        if (!selectedNode?.id) return;
        updateNode(selectedNode?.id, { selected: false });
    };

    // ---------- Move Mode Change ----------
    const [moveMode, setMoveMode] = useState<MoveMode>('hand');
    const isPanMode = moveMode === 'hand';

    // ---------- Save Workflow ----------
    const navigate = useNavigate();
    const [saveLoading, setSaveLoading] = useState(false);
    const handleSave = async () => {
        const flowData = cloneDeep(toObject());
        const isAdvanceMode = designMode === 'advanced';

        if (isAdvanceMode) {
            let jsonData: Pick<WorkflowSchema, 'nodes' | 'edges'>;

            try {
                jsonData = JSON.parse(editorFlowData || '{}');
            } catch (e) {
                console.warn(e);
                toast.error({ content: getIntlText('common.message.json_format_error') });
                return;
            }

            flowData.nodes = jsonData.nodes;
            flowData.edges = jsonData.edges;
        }

        let { nodes, edges } = flowData;

        if (!checkWorkflowValid(nodes, edges)) return;
        // Collect the real entities obtained under entity assignment
        let entityList: ObjectToCamelCase<EntityData[]> = [];
        const entityAssignerNodes = nodes.filter(node => node.componentName === 'entityAssigner');
        if (entityAssignerNodes.length) {
            const [err, res] = await awaitWrap(
                entityAPI.getList({
                    page_size: 9999,
                    page_number: 1,
                    entity_keys: Object.keys(
                        entityAssignerNodes.reduce(
                            (acc, node, index) => {
                                if (node?.data?.parameters?.exchangePayload) {
                                    acc = Object.assign(
                                        acc,
                                        node?.data?.parameters?.exchangePayload,
                                    );
                                }
                                return acc;
                            },
                            {} as Record<string, string>,
                        ),
                    ).filter(v => !!v),
                }),
            );
            const respData = getResponseData(res);
            if (!err && isRequestSuccess(res) && !!respData) {
                entityList = objectToCamelCase(respData)?.content || [];
            }
        }

        // Check edges and nodes
        const edgesCheckResult = merge(
            checkEdgesId(edges, nodes, { validateFirst: true }),
            checkEdgesType(edges, nodes, { validateFirst: true }),
        );
        if (!isEmpty(edgesCheckResult)) return;

        const nodesCheckResult = merge(
            checkNodesId(nodes, { validateFirst: isAdvanceMode }),
            checkNodesType(nodes, { validateFirst: isAdvanceMode }),
            checkNodesData(nodes, edges, { validateFirst: isAdvanceMode, entityList }),
        );
        if (!isEmpty(nodesCheckResult)) {
            if (isAdvanceMode) return;
            const statusData = Object.entries(nodesCheckResult).reduce(
                (acc, [id, item]) => {
                    acc[id] = item.status;
                    return acc;
                },
                {} as NonNullable<Parameters<typeof updateNodesStatus>[0]>,
            );

            setNodesDataValidResult(nodesCheckResult);
            updateNodesStatus(statusData);
            return;
        }
        updateNodesStatus(null);
        setNodesDataValidResult(null);

        if (!basicData?.name) return;

        // Clear selected status
        const selectedNode = nodes.find(node => node.selected);
        if (selectedNode) updateNode(selectedNode.id, { selected: false });

        // const hasTriggerNode = nodes.find(node => node.type === 'trigger');
        // // If has a trigger node and it is the first time to create, show tip
        // if (!wid && hasTriggerNode) {
        //     let proceed = false;
        //     await confirm({
        //         icon: <InfoIcon />,
        //         type: 'info',
        //         title: getIntlText('common.label.tip'),
        //         description: getIntlText('workflow.editor.editor_auto_create_service_entity_tip'),
        //         onConfirm() {
        //             proceed = true;
        //         },
        //     });

        //     if (!proceed) return;
        // }

        // Remove selected, dragging, hovering and `$xxx` property
        nodes = normalizeNodes(nodes, FROZEN_NODE_PROPERTY_KEYS);
        edges = normalizeEdges(edges);

        // TODO: referenced warning confirm ?

        setSaveLoading(true);
        const [error, resp] = await awaitWrap(
            workflowAPI.saveFlowDesign({
                ...basicData,
                name: basicData.name,
                design_data: JSON.stringify({ nodes, edges, viewport: flowData.viewport }),
            }),
        );

        setSaveLoading(false);
        if (error || !isRequestSuccess(resp)) return;
        const respData = getResponseData(resp);

        setBasicData(data => {
            const result = data || {};
            result.version = respData?.version ? respData.version : result.version;

            return result;
        });
        toast.success(getIntlText('common.message.operation_success'));
        setIsPreventLeave(false);
        setTimeout(() => navigate('/workflow'), 100);
    };

    // Reset state when leave
    useEffect(() => {
        return () => {
            setOpenLogPanel(false);
            setIsPreventLeave(false);
            setTestLogs(undefined);
            setLogDetail(undefined);
        };
    }, []);

    return (
        <div className="ms-main">
            <Topbar
                data={basicData}
                loading={flowDataLoading}
                disabled={saveLoading || isLogMode}
                mode={designMode}
                onDataChange={handleFlowDataChange}
                onDesignModeChange={handleDesignModeChange}
                onBeforeBack={handleBeforeBack}
                rightSlot={[
                    <TestButton
                        key="test-button"
                        disabled={
                            designMode === 'advanced' ||
                            !nodes?.length ||
                            nodeConfigLoading ||
                            saveLoading
                        }
                    />,
                    <LoadingButton
                        key="save-button"
                        variant="contained"
                        disabled={!nodes?.length || isLogMode}
                        loading={saveLoading}
                        // startIcon={<CheckIcon />}
                        onClick={handleSave}
                    >
                        {getIntlText('common.button.save')}
                    </LoadingButton>,
                ]}
            />
            <div className="ms-view ms-view-wf_editor">
                <div className="ms-view__inner">
                    <ReactFlow<WorkflowNode, WorkflowEdge>
                        fitView
                        fitViewOptions={{ maxZoom: MAX_PRETTY_ZOOM }}
                        className="ms-workflow"
                        minZoom={MIN_ZOOM}
                        maxZoom={MAX_ZOOM}
                        deleteKeyCode={DELETE_KEY_CODE}
                        panOnDrag={isPanMode}
                        selectionOnDrag={!isPanMode}
                        selectNodesOnDrag={false}
                        selectionKeyCode={null}
                        multiSelectionKeyCode={null}
                        selectionMode={SelectionMode.Partial}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodes={nodes}
                        edges={edges}
                        onBeforeDelete={handleBeforeDelete}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={handleConnect}
                        onEdgeMouseEnter={handleEdgeMouseEnter}
                        onEdgeMouseLeave={handleEdgeMouseLeave}
                    >
                        <Background />
                        <Controls
                            minZoom={MIN_ZOOM}
                            maxZoom={MAX_ZOOM}
                            addable={!isLogMode}
                            moveMode={moveMode}
                            designMode={designMode}
                            onMoveModeChange={setMoveMode}
                        />
                        <HelperLines
                            horizontal={helperLineHorizontal}
                            vertical={helperLineVertical}
                        />
                        <LogPanel designMode={designMode} />
                        <ConfigPanel readonly={isLogMode} />
                        <EntryPanel isEditing={!!wid} loading={flowDataLoading} />
                    </ReactFlow>
                    {designMode === 'advanced' && (
                        <div className="ms-workflow-advance">
                            <CodeEditor
                                editorLang="json"
                                readOnly={isLogMode}
                                editable={!isLogMode}
                                renderHeader={() => null}
                                value={editorFlowData}
                                onChange={value => {
                                    setIsPreventLeave(true);
                                    setEditorFlowData(value);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(() => (
    <ReactFlowProvider>
        <WorkflowEditor />
    </ReactFlowProvider>
));
