import { useCallback, useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { getOutgoers } from '@xyflow/react';
import { cloneDeep, isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { AccordionCard, AccordionHeader, AccordionTree } from './components';
import { basicNodeConfigs } from '../../config';
import { ALPHABET_LIST } from './constant';
import type { AccordionLog, WorkflowDataType, WorkflowTraceType } from './types';
import './style.less';

interface IProps {
    traceData: WorkflowTraceType[];
    workflowData: WorkflowDataType;
}
type WorkflowNestNode = WorkflowNode & {
    attrs: AccordionLog;
    children?: WorkflowNestNode[];
};
type LevelStructType = {
    label: string;
    value: number;
    parentValue?: number;
};
const entryNodeConfigs = Object.values(basicNodeConfigs).filter(node => node.category === 'entry');
export default function AccordionUsage({ traceData, workflowData }: IProps) {
    const { getIntlText } = useI18n();

    /** generate trace Map */
    const traceMap = useMemo(() => {
        return (traceData || []).reduce(
            (acc, cur) => {
                const { nodeId } = objectToCamelCase(cur || {});
                acc[nodeId] = cur;
                return acc;
            },
            {} as Record<string, WorkflowTraceType>,
        );
    }, [traceData]);
    /** Add required attributes */
    const wrapperNode = useCallback(
        (node: WorkflowNode): WorkflowNestNode => {
            const nestNode = cloneDeep(node) as WorkflowNestNode;
            // TODO name
            const { id, type, $$name } = nestNode || {};
            const { status, input, output, time_cost: timeCost } = traceMap[id] || {};

            nestNode.attrs = {
                name: $$name,
                type: type!,
                status: status === 'SUCCESS' ? 'success' : 'failed',
                timeCost,
                input,
                output,
            };

            return nestNode;
        },
        [traceMap],
    );
    /** Determine whether it is the root node */
    const isRootNode = (node: WorkflowNestNode) => {
        const { type } = node || {};
        return entryNodeConfigs.some(config => config.type === type);
    };
    /** Generate Tree Data */
    const treeData = useMemo(() => {
        // TODO Reconstructs the tree generation logic
        const { nodes, edges } = workflowData || {};
        const nestNodes = (nodes || []).map(node => wrapperNode(node));

        const root: WorkflowNestNode[] = [];
        (nestNodes || []).forEach(node => {
            /** get Root Node */
            const isRoot = isRootNode(node);
            isRoot && root.push(node);

            const outgoers = getOutgoers(node, nestNodes, edges) as WorkflowNestNode[];
            /** Generating nested struct data */
            if (outgoers.length) {
                node.children = [...(node.children || []), ...outgoers];
            }
        });

        return root;
    }, [workflowData, wrapperNode]);

    /** recursive rendering */
    const renderAccordion = (data: WorkflowNestNode, levelStruct: LevelStructType) => {
        const { children, attrs, ...item } = data || {};
        /** get parallel text */
        const { label: levelLabel, value: levelValue, parentValue } = levelStruct || {};
        const parentText = !isNil(parentValue) ? `${ALPHABET_LIST[parentValue]}` : '';
        const parallelLabel = `${levelLabel}${parentText}`;
        const parallelText = getIntlText('workflow.label.parallel', {
            1: `-${parallelLabel}`,
        });

        return (
            <>
                <AccordionCard header={<AccordionHeader data={attrs} />}>
                    {/* // TODO */}
                    <div>input</div>
                </AccordionCard>
                {children && (
                    <AccordionTree header={parallelText}>
                        {children.map((child, ind) => {
                            const nextLevel = levelValue + 1;
                            const branchLabel = ALPHABET_LIST[ind];
                            const branchText = getIntlText('workflow.label.branch', {
                                1: `-${parallelLabel}-${branchLabel}`,
                            });

                            return (
                                <Fragment key={item.id}>
                                    <div className="ms-log-branch">{branchText}</div>
                                    {renderAccordion(child, {
                                        label: `${nextLevel + 1}`,
                                        value: nextLevel,
                                        parentValue: children.length > 1 ? ind : void 0,
                                    })}
                                </Fragment>
                            );
                        })}
                    </AccordionTree>
                )}
            </>
        );
    };
    return (
        <div className="ms-action-log">
            {treeData.map((item, index) => (
                <Fragment key={item.id}>
                    {renderAccordion(item, { label: `${index + 1}`, value: index })}
                </Fragment>
            ))}
        </div>
    );
}
