import React, { useMemo, useEffect, useState } from 'react';
import { Position, useReactFlow, useUpdateNodeInternals, type NodeProps } from '@xyflow/react';
import { isString } from 'lodash-es';
import { useDebounceEffect } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import { basicNodeConfigs } from '@/pages/workflow/config';
import { logicOperatorMap, conditionOperatorMap, DEFAULT_NODE_HEIGHT } from '../../constants';
import useWorkflow from '../../hooks/useWorkflow';
import Handle from '../handle';
import NodeContainer from '../node-container';
import './style.less';

export type IfElseNode = WorkflowNode<'ifelse'>;

const NODE_HEADER_HEIGHT = 12 + 24 + 8;

const CONDITION_TITLE_HEIGHT = 22;
const CONDITION_HEIGHT = 28;
const CONDITION_GAP = 4;
const CONDITION_BLOCK_GAP = 8;

const nodeConfig = basicNodeConfigs.ifelse;

const DEFAULT_IF_SOURCE_HANDLE_ID = '$temp:if';
const DEFAULT_ELSE_SOURCE_HANDLE_ID = '$temp:else';

const calculateHandleTop = (blockIndex: number, preConditionCount: number) => {
    return (
        NODE_HEADER_HEIGHT +
        blockIndex * CONDITION_BLOCK_GAP +
        (blockIndex + 0.5) * CONDITION_TITLE_HEIGHT +
        preConditionCount * (CONDITION_HEIGHT + CONDITION_GAP)
    );
};

/**
 * IFELSE Node
 */
const IfElseNode: React.FC<NodeProps<IfElseNode>> = props => {
    const { getIntlText } = useI18n();
    const [finalProps, setFinalProps] = useState(props);
    const { id: nodeId, selected } = finalProps;

    useDebounceEffect(
        () => {
            setFinalProps(props);
        },
        [props],
        { wait: 300 },
    );

    // ---------- Render Handles ----------
    const { when, otherwise } = finalProps.data.parameters?.choice || {};
    const whenList = useMemo(
        () =>
            when ||
            ([{ id: DEFAULT_IF_SOURCE_HANDLE_ID, conditions: [] }] as unknown as NonNullable<
                typeof when
            >),
        [when],
    );
    const otherwiseItem = useMemo(
        () => otherwise || { id: DEFAULT_ELSE_SOURCE_HANDLE_ID },
        [otherwise],
    );
    const conditionCount = whenList.reduce((acc, item) => {
        const count = item.expressionType === 'mvel' ? 1 : item.conditions?.length || 1;
        return acc + count;
    }, 0);
    const handles = useMemo(() => {
        const result = [
            <Handle
                type="target"
                position={Position.Left}
                nodeProps={finalProps}
                style={{ top: DEFAULT_NODE_HEIGHT / 2 }}
            />,
        ];

        whenList.forEach((block, index) => {
            const preConditionCount = whenList.slice(0, index).reduce((acc, item) => {
                const count = item.expressionType === 'mvel' ? 1 : item.conditions?.length || 1;
                return acc + count;
            }, 0);

            result.push(
                <Handle
                    id={`${block.id}`}
                    type="source"
                    position={Position.Right}
                    nodeProps={finalProps}
                    style={{ top: calculateHandleTop(index, preConditionCount) }}
                />,
            );
        });

        const preConditionCount = whenList.reduce((acc, item) => {
            const count = item.expressionType === 'mvel' ? 1 : item.conditions?.length || 1;
            return acc + count;
        }, 0);
        result.push(
            <Handle
                id={`${otherwiseItem.id}`}
                type="source"
                position={Position.Right}
                nodeProps={finalProps}
                style={{ top: calculateHandleTop(whenList?.length || 1, preConditionCount) - 1 }}
            />,
        );
        return result;
    }, [whenList.length, conditionCount, otherwiseItem.id]);

    // ---------- Update Edges ----------
    const { getUpstreamNodeParams } = useWorkflow();
    const { getNode, getEdges, setEdges } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const updateNodeInternals = useUpdateNodeInternals();
    const [, nodeParams] = getUpstreamNodeParams(getNode(finalProps.id));

    // Replace the temp handle id to real id; Remove the useless edges;
    useEffect(() => {
        if (!selected) {
            updateNodeInternals(nodeId);
            return;
        }

        if (!when?.length || !otherwise) return;
        let edges = [...getEdges()];
        const handleIds = when
            .map(item => item.id)
            .concat(otherwise.id, DEFAULT_IF_SOURCE_HANDLE_ID, DEFAULT_ELSE_SOURCE_HANDLE_ID);

        edges = edges.filter(edge => {
            if (edge.source !== nodeId) return true;
            if (handleIds.includes(edge.sourceHandle!)) return true;
            return false;
        });

        edges.map(edge => {
            let { sourceHandle } = edge;

            if (edge.source !== nodeId) return edge;
            switch (edge.sourceHandle) {
                case DEFAULT_IF_SOURCE_HANDLE_ID: {
                    sourceHandle = `${when[0].id || DEFAULT_IF_SOURCE_HANDLE_ID}`;
                    break;
                }
                case DEFAULT_ELSE_SOURCE_HANDLE_ID: {
                    sourceHandle = `${otherwise.id || DEFAULT_ELSE_SOURCE_HANDLE_ID}`;
                    break;
                }
                default: {
                    break;
                }
            }

            edge.sourceHandle = sourceHandle;

            return edge;
        });

        setEdges(edges);
        updateNodeInternals(nodeId);
    }, [nodeId, when, otherwise, selected, getEdges, setEdges, updateNodeInternals]);

    return (
        <NodeContainer
            type="ifelse"
            title={getIntlText(nodeConfig.labelIntlKey)}
            icon={nodeConfig.icon}
            iconBgColor={nodeConfig.iconBgColor}
            nodeProps={finalProps}
            handles={handles}
        >
            <div className="ms-condition-block-root">
                {whenList?.map((block, blockIndex) => (
                    <div className="ms-condition-block" key={block.id}>
                        <div className="ms-condition-block-title">
                            {blockIndex === 0
                                ? getIntlText('workflow.label.logic_keyword_if')
                                : getIntlText('workflow.label.logic_keyword_elseif')}
                        </div>
                        <div className="ms-condition-list">
                            {!block.conditions.length && (
                                <div className="ms-condition-item">
                                    <span className="placeholder">
                                        {getIntlText('workflow.editor.valid.condition_not_setup')}
                                    </span>
                                </div>
                            )}
                            {block.conditions?.map((condition, index) => {
                                const { expressionValue, expressionDescription } = condition;
                                const param = isString(expressionValue)
                                    ? undefined
                                    : nodeParams?.find(
                                          param => param.valueKey === expressionValue?.key,
                                      );
                                const operatorText =
                                    isString(expressionValue) || !expressionValue?.operator
                                        ? undefined
                                        : getIntlText(
                                              conditionOperatorMap[expressionValue.operator]
                                                  ?.labelIntlKey || '',
                                          );
                                const logicOperatorText = getIntlText(
                                    logicOperatorMap[block.logicOperator]?.labelIntlKey || '',
                                );

                                let isEmpty = true;
                                if (isString(expressionValue)) {
                                    isEmpty = !expressionValue || !expressionDescription;
                                } else {
                                    const operator = expressionValue?.operator;
                                    if (operator === 'IS_EMPTY' || operator === 'IS_NOT_EMPTY') {
                                        isEmpty =
                                            !expressionValue?.key || !expressionValue?.operator;
                                    } else {
                                        isEmpty =
                                            !expressionValue?.key ||
                                            !expressionValue?.operator ||
                                            !expressionValue?.value;
                                    }
                                }

                                return (
                                    <div className="ms-condition-item" key={condition.id}>
                                        {isEmpty ? (
                                            <span className="placeholder">
                                                {getIntlText(
                                                    'workflow.editor.valid.condition_not_setup',
                                                )}
                                            </span>
                                        ) : isString(expressionValue) ? (
                                            <Tooltip
                                                autoEllipsis
                                                className="description"
                                                title={expressionDescription}
                                            />
                                        ) : (
                                            <>
                                                <Tooltip
                                                    autoEllipsis
                                                    className="name"
                                                    title={param?.valueName || expressionValue?.key}
                                                />
                                                <span className="operator">{operatorText}</span>
                                                <Tooltip autoEllipsis className="value" title="" />
                                                {index === block.conditions.length && (
                                                    <span className="logic-operator">
                                                        {logicOperatorText}
                                                    </span>
                                                )}
                                                <Tooltip
                                                    autoEllipsis
                                                    className="value"
                                                    title={expressionValue?.value}
                                                />
                                            </>
                                        )}
                                        {index !== block.conditions.length - 1 && (
                                            <span className="logic-operator">
                                                {logicOperatorText}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <div className="ms-condition-block">
                    <div className="ms-condition-block-title">
                        {getIntlText('workflow.label.logic_keyword_else')}
                    </div>
                </div>
            </div>
        </NodeContainer>
    );
};

export default React.memo(IfElseNode);
