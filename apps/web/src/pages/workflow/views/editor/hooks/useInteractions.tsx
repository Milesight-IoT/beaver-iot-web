import { useCallback } from 'react';
import {
    getIncomers,
    getOutgoers,
    useReactFlow,
    type OnConnect,
    type ReactFlowProps,
} from '@xyflow/react';
import { useSize } from 'ahooks';
import { cloneDeep, maxBy } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { useConfirm } from '@/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import { genUuid } from '../helper';
import {
    NODE_SPACING_X,
    NODE_SPACING_Y,
    DEFAULT_NODE_WIDTH,
    DEFAULT_NODE_HEIGHT,
    EDGE_TYPE_ADDABLE,
} from '../constants';
import useFlowStore from '../store';
import useWorkflow from './useWorkflow';

type RFProps = ReactFlowProps<WorkflowNode, WorkflowEdge>;

/**
 * The closest node payload type for AddNode function
 */
export type AddNodeClosestPayloadParam = {
    prevNodeId?: ApiKey;
    prevNodeSourceHandle?: string | null;
    nextNodeId?: ApiKey;
    nextNodeTargetHandle?: string | null;
};

type AddNodeFunc = (
    newNodePayload: {
        nodeType: WorkflowNodeType;
        sourceHandle?: ApiKey;
        targetHandle?: ApiKey;
        position?: {
            x: number;
            y: number;
        };
    },
    closestNodePayload?: AddNodeClosestPayloadParam,
) => void;

/**
 * Workflow Interactions Hook
 */
const useInteractions = () => {
    const {
        getNodes,
        getEdges,
        setNodes,
        setEdges,
        addEdges,
        updateEdgeData,
        fitView,
        flowToScreenPosition,
    } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const isLogMode = useFlowStore(state => state.isLogMode());
    const { checkParallelLimit, checkNestedParallelLimit } = useWorkflow();
    const { width: bodyWidth, height: bodyHeight } = useSize(document.querySelector('body')) || {};
    const { getIntlText } = useI18n();

    // Handle nodes connect
    const handleConnect = useCallback<OnConnect>(
        connection => {
            const nodes = getNodes();
            const edges = getEdges();
            const newEdge = { ...connection, id: genUuid('edge'), type: EDGE_TYPE_ADDABLE };

            if (!checkNestedParallelLimit(nodes, [...edges, newEdge])) return;
            addEdges([newEdge]);
        },
        [addEdges, checkNestedParallelLimit, getEdges, getNodes],
    );

    // Check before node delete
    const confirm = useConfirm();
    const handleBeforeDelete = useCallback<NonNullable<RFProps['onBeforeDelete']>>(
        async ({ nodes }) => {
            const hasEntryNode = nodes.some(
                node =>
                    node.type === 'trigger' || node.type === 'timer' || node.type === 'listener',
            );

            if (hasEntryNode || isLogMode) return false;

            if (nodes.length) {
                let result = false;
                await confirm({
                    title: getIntlText('workflow.editor.node_delete_confirm_title'),
                    description: getIntlText('workflow.editor.node_delete_confirm_desc'),
                    onConfirm: async () => {
                        result = true;
                    },
                });

                return result;
            }

            return true;
        },
        [isLogMode, confirm, getIntlText],
    );

    // Handle edge mouse enter
    const handleEdgeMouseEnter = useCallback<NonNullable<RFProps['onEdgeMouseEnter']>>(
        (e, edge) => {
            e.stopPropagation();
            updateEdgeData(edge.id, { $hovering: true });
        },
        [updateEdgeData],
    );

    // Handle edge mouse leave
    const handleEdgeMouseLeave = useCallback<NonNullable<RFProps['onEdgeMouseLeave']>>(
        (e, edge) => {
            e.stopPropagation();
            updateEdgeData(edge.id, { $hovering: false });
        },
        [updateEdgeData],
    );

    // Add New Node
    const addNode = useCallback<AddNodeFunc>(
        (
            { nodeType, position },
            { prevNodeId, prevNodeSourceHandle, nextNodeId, nextNodeTargetHandle } = {},
        ) => {
            const nodes = cloneDeep(getNodes());
            const edges = cloneDeep(getEdges());
            const prevNode = nodes.find(node => node.id === prevNodeId);
            const nextNode = nodes.find(node => node.id === nextNodeId);
            const nodeConfig = basicNodeConfigs[nodeType] || {};
            const newNode: WorkflowNode = {
                id: genUuid('node'),
                type: nodeType,
                componentName: nodeConfig.componentName,
                position: position || {
                    x: 0,
                    y: 0,
                },
                data: {},
            };

            if (prevNode && nextNode) {
                // ----- Button at the edge -----
                // Update current edge
                const edge = edges.find(
                    edge => edge.source === prevNodeId && edge.target === nextNodeId,
                )!;
                edge.target = newNode.id;

                // Add new Edge
                if (newNode.type !== 'ifelse') {
                    edges.push({
                        id: genUuid('edge'),
                        type: EDGE_TYPE_ADDABLE,
                        source: newNode.id,
                        target: nextNode.id,
                        targetHandle: nextNodeTargetHandle,
                    });
                }

                newNode.position = {
                    x: nextNode.position.x,
                    y: nextNode.position.y,
                };
                nodes.push(newNode);

                const updateNodesPosition = (startNode: WorkflowNode) => {
                    const innerNextNode = nodes.find(item => item.id === startNode.id)!;

                    innerNextNode.position = {
                        x:
                            startNode.position.x +
                            NODE_SPACING_X +
                            (innerNextNode.measured?.width || DEFAULT_NODE_WIDTH),
                        y: startNode.position.y,
                    };

                    const outgoers = getOutgoers(startNode, nodes, edges);

                    outgoers.forEach(item => updateNodesPosition(item));
                };
                updateNodesPosition(nextNode);
            } else if (!prevNode && nextNode) {
                // ----- Button at the node target handle -----
                const newEdge: WorkflowEdge | undefined = {
                    id: genUuid('edge'),
                    type: 'addable',
                    source: newNode.id,
                    target: nextNode.id,
                    targetHandle: nextNodeTargetHandle,
                };
                const incomers = getIncomers(nextNode, nodes, edges);

                if (!incomers.length) {
                    newNode.position = {
                        x:
                            nextNode.position.x -
                            NODE_SPACING_X -
                            (nextNode.measured?.width || DEFAULT_NODE_WIDTH),
                        y: nextNode.position.y,
                    };
                } else {
                    const maxYIncomer = maxBy(incomers, item => item.position.y)!;

                    newNode.position = {
                        x: maxYIncomer.position.x,
                        y:
                            maxYIncomer.position.y +
                            NODE_SPACING_Y +
                            (maxYIncomer.measured?.height || DEFAULT_NODE_HEIGHT),
                    };
                }

                nodes.push(newNode);
                edges.push(newEdge);
            } else if (prevNode && !nextNode) {
                // ----- Button at the node source handle -----
                const newEdge: WorkflowEdge | undefined = {
                    id: genUuid('edge'),
                    type: EDGE_TYPE_ADDABLE,
                    source: prevNode.id,
                    target: newNode.id,
                    sourceHandle: prevNodeSourceHandle,
                };
                const outgoers = getOutgoers(prevNode, nodes, edges);

                if (!checkParallelLimit(prevNodeId!, prevNodeSourceHandle)) return;

                if (!outgoers.length) {
                    newNode.position = {
                        x:
                            prevNode.position.x +
                            NODE_SPACING_X +
                            (prevNode.measured?.width || DEFAULT_NODE_WIDTH),
                        y: prevNode.position.y,
                    };
                } else {
                    const maxYOutgoer = maxBy(outgoers, item => item.position.y)!;

                    newNode.position = {
                        x: maxYOutgoer.position.x,
                        y:
                            maxYOutgoer.position.y +
                            NODE_SPACING_Y +
                            (maxYOutgoer.measured?.height || DEFAULT_NODE_HEIGHT),
                    };
                }

                nodes.push(newNode);
                edges.push(newEdge);
            } else {
                // ----- Button at the control bar -----
                nodes.push(newNode);
            }

            if (!checkNestedParallelLimit(nodes, edges)) return;

            setNodes(nodes);
            setEdges(edges);

            if (!bodyWidth || !bodyHeight) return;
            // Node bottom right corner position
            const screenPosition = flowToScreenPosition({
                x: newNode.position.x + DEFAULT_NODE_WIDTH,
                y: newNode.position.y + DEFAULT_NODE_HEIGHT,
            });

            if (screenPosition.x > bodyWidth || screenPosition.y > bodyHeight) {
                setTimeout(() => fitView({ duration: 300 }), 0);
            }
        },
        [
            bodyWidth,
            bodyHeight,
            getNodes,
            getEdges,
            setNodes,
            setEdges,
            fitView,
            flowToScreenPosition,
            checkParallelLimit,
            checkNestedParallelLimit,
        ],
    );

    return {
        addNode,
        handleConnect,
        handleBeforeDelete,
        handleEdgeMouseEnter,
        handleEdgeMouseLeave,
    };
};

export default useInteractions;
