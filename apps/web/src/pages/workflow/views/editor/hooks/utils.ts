import { isEqual, groupBy } from 'lodash-es';
import { getIncomers, getOutgoers, getConnectedEdges } from '@xyflow/react';
import { basicNodeConfigs } from '@/pages/workflow/config';

type ParallelInfoItem = {
    parallelNodeId: ApiKey;
    depth: number;
    isBranch?: boolean;
};

type NodeParallelInfo = {
    parallelNodeId: ApiKey;
    edgeHandleId: ApiKey;
    depth: number;
};

type NodeHandle = {
    node: WorkflowNode;
    handle?: string;
};

type NodeStreamInfo = {
    upstreamNodes: Set<ApiKey>;
    downstreamEdges: Set<ApiKey>;
};

const entryNodeTypes = Object.values(basicNodeConfigs)
    .filter(item => item.category === 'entry')
    .map(item => item.type);

/**
 * Get Parallel Info
 */
export const getParallelInfo = (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    parentNodeId?: ApiKey,
) => {
    let startNode;

    if (parentNodeId) {
        const parentNode = nodes.find(node => node.id === parentNodeId);
        if (!parentNode) throw new Error('Parent node not found');

        startNode = nodes.find(node => node.id === (parentNode.data as any).start_node_id);
    } else {
        startNode = nodes.find(node => entryNodeTypes.includes(node.type as WorkflowNodeType));
    }
    if (!startNode) throw new Error('Start node not found');

    const parallelList = [] as ParallelInfoItem[];
    const nextNodeHandles: NodeHandle[] = [{ node: startNode }];
    let hasAbnormalEdges = false;

    const traverse = (firstNodeHandle: NodeHandle) => {
        const nodeEdgesSet = {} as Record<string, Set<string>>;
        const totalEdgesSet = new Set<string>();
        const nextHandles = [firstNodeHandle];
        const streamInfo = {} as Record<string, NodeStreamInfo>;
        const parallelListItem = {
            parallelNodeId: '',
            depth: 0,
        } as ParallelInfoItem;
        const nodeParallelInfoMap = {} as Record<string, NodeParallelInfo>;
        nodeParallelInfoMap[firstNodeHandle.node.id] = {
            parallelNodeId: '',
            edgeHandleId: '',
            depth: 0,
        };

        while (nextHandles.length) {
            const currentNodeHandle = nextHandles.shift()!;
            const { node: currentNode, handle: currentHandle } = currentNodeHandle;
            const currentNodeHandleKey = currentNode.id;
            const connectedEdges = getConnectedEdges([currentNode], edges).filter(
                edge => edge.source === currentNode.id,
            );
            const connectedEdgesLength = connectedEdges.length;
            const outgoers = getOutgoers(currentNode, nodes, edges);
            const incomers = getIncomers(currentNode, nodes, edges);

            if (!streamInfo[currentNodeHandleKey]) {
                streamInfo[currentNodeHandleKey] = {
                    upstreamNodes: new Set<string>(),
                    downstreamEdges: new Set<string>(),
                };
            }

            if (nodeEdgesSet[currentNodeHandleKey]?.size > 0 && incomers.length > 1) {
                const newSet = new Set<string>();
                for (const item of totalEdgesSet) {
                    if (!streamInfo[currentNodeHandleKey].downstreamEdges.has(item))
                        newSet.add(item);
                }
                if (isEqual(nodeEdgesSet[currentNodeHandleKey], newSet)) {
                    parallelListItem.depth = nodeParallelInfoMap[currentNode.id].depth;
                    nextNodeHandles.push({ node: currentNode, handle: currentHandle });
                    break;
                }
            }

            if (nodeParallelInfoMap[currentNode.id].depth > parallelListItem.depth)
                parallelListItem.depth = nodeParallelInfoMap[currentNode.id].depth;

            // eslint-disable-next-line no-loop-func
            outgoers.forEach(outgoer => {
                const outgoerConnectedEdges = getConnectedEdges([outgoer], edges).filter(
                    edge => edge.source === outgoer.id,
                );
                const sourceEdgesGroup = groupBy(outgoerConnectedEdges, 'sourceHandle');
                const incomers = getIncomers(outgoer, nodes, edges);

                // Parallel nodes are not allowed as multiple target nodes
                if (outgoers.length > 1 && incomers.length > 1) hasAbnormalEdges = true;

                Object.keys(sourceEdgesGroup).forEach(sourceHandle => {
                    nextHandles.push({ node: outgoer, handle: sourceHandle });
                });
                if (!outgoerConnectedEdges.length) nextHandles.push({ node: outgoer });

                const outgoerKey = outgoer.id;
                if (!nodeEdgesSet[outgoerKey]) nodeEdgesSet[outgoerKey] = new Set<string>();

                if (nodeEdgesSet[currentNodeHandleKey]) {
                    for (const item of nodeEdgesSet[currentNodeHandleKey])
                        nodeEdgesSet[outgoerKey].add(item);
                }

                if (!streamInfo[outgoerKey]) {
                    streamInfo[outgoerKey] = {
                        upstreamNodes: new Set<string>(),
                        downstreamEdges: new Set<string>(),
                    };
                }

                if (!nodeParallelInfoMap[outgoer.id]) {
                    nodeParallelInfoMap[outgoer.id] = {
                        ...nodeParallelInfoMap[currentNode.id],
                    };
                }

                if (connectedEdgesLength > 1) {
                    const edge = connectedEdges.find(edge => edge.target === outgoer.id)!;
                    nodeEdgesSet[outgoerKey].add(edge.id);
                    totalEdgesSet.add(edge.id);

                    streamInfo[currentNodeHandleKey].downstreamEdges.add(edge.id);
                    streamInfo[outgoerKey].upstreamNodes.add(currentNodeHandleKey);

                    for (const item of streamInfo[currentNodeHandleKey].upstreamNodes)
                        streamInfo[item].downstreamEdges.add(edge.id);

                    if (!parallelListItem.parallelNodeId)
                        parallelListItem.parallelNodeId = currentNode.id;

                    const prevDepth = nodeParallelInfoMap[currentNode.id].depth + 1;
                    const currentDepth = nodeParallelInfoMap[outgoer.id].depth;

                    nodeParallelInfoMap[outgoer.id].depth = Math.max(prevDepth, currentDepth);
                } else {
                    for (const item of streamInfo[currentNodeHandleKey].upstreamNodes)
                        streamInfo[outgoerKey].upstreamNodes.add(item);

                    nodeParallelInfoMap[outgoer.id].depth =
                        nodeParallelInfoMap[currentNode.id].depth;
                }
            });
        }

        parallelList.push(parallelListItem);
    };

    while (nextNodeHandles.length) {
        const nodeHandle = nextNodeHandles.shift()!;
        traverse(nodeHandle);
    }

    return {
        parallelList,
        hasAbnormalEdges,
    };
};
