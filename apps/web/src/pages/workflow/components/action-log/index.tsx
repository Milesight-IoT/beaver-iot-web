import React, { useMemo } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { Alert } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components';
import { AccordionCard, AccordionHeader, AccordionTree, ActionCodeEditor } from './components';
import { useNestedData } from './hooks';
import { ALPHABET_LIST } from './constant';
import type { ActionLogProps, WorkflowNestNode } from './types';
import './style.less';

function safeJsonParse(str: string) {
    try {
        const result = JSON.parse(str);
        return JSON.stringify(result, null, 2);
    } catch (e) {
        return str;
    }
}
/**
 * get alphabet index
 * @example getAlphabetIndex(0) => A
 */
const getAlphabetIndex = (index: number) => {
    if (index < 0) return;

    if (index > 26) {
        const first = Math.floor(index / 26);
        const second = index % 26;
        return `${ALPHABET_LIST[first - 1]}${ALPHABET_LIST[second]}`;
    }
    return ALPHABET_LIST[index];
};
export default React.memo(({ traceData, workflowData }: ActionLogProps) => {
    const { getIntlText } = useI18n();
    const { treeData } = useNestedData({ workflowData, traceData });

    const renderTreeData = useMemo(() => {
        return treeData.map(data => {
            const { attrs } = data || {};
            const { input, output } = attrs || {};

            return {
                ...(data || {}),
                attrs: {
                    ...attrs,
                    input: safeJsonParse(input!),
                    output: safeJsonParse(output!),
                },
            };
        });
    }, [treeData]);

    /** recursive rendering */
    const renderAccordion = (
        treeData: WorkflowNestNode[],
        level: number = 0,
        parallelTitle = '',
    ) => {
        // Existence of parallel branches
        const parallelBranchCount = treeData.reduce((acc, cur) => {
            if (cur.children?.length) acc++;
            return acc;
        }, 0);
        const hasParallelBranch = parallelBranchCount > 1;
        // current level
        const currentLevel = level + 1;
        // There are multiple parallel branches
        let multiBranchInParallelIndex = -1;

        return treeData.map((data, index) => {
            const { children, attrs } = data || {};
            const { input, output, errorMessage, $$token, $$isParallelBranch } = attrs || {};

            // If there are child nodes, increment the index
            if ((children?.length || 0) > 1) {
                multiBranchInParallelIndex++;
            }

            const parallelLabel = hasParallelBranch
                ? `${currentLevel}${getAlphabetIndex(multiBranchInParallelIndex)}`
                : `${currentLevel}`;

            // Text to be displayed
            const parallelText = getIntlText('workflow.label.parallel', {
                1: `-${parallelLabel}`,
            });
            const branchText = getIntlText('workflow.label.branch', {
                1: `-${parallelTitle}-${getAlphabetIndex(index)}`,
            });

            return (
                <Fragment key={$$token}>
                    {!$$isParallelBranch && <div className="ms-log-branch">{branchText}</div>}
                    <AccordionCard header={<AccordionHeader data={attrs} />}>
                        {errorMessage && (
                            <div className="ms-action-log__alert">
                                <Alert severity="error" icon={false}>
                                    <Tooltip autoEllipsis title={errorMessage} />
                                </Alert>
                            </div>
                        )}
                        {input && (
                            <div className="ms-action-log__input">
                                <ActionCodeEditor
                                    value={input}
                                    title={getIntlText('common.label.input')}
                                />
                            </div>
                        )}
                        {output && (
                            <div className="ms-action-log__output">
                                <ActionCodeEditor
                                    value={output}
                                    title={getIntlText('common.label.output')}
                                />
                            </div>
                        )}
                    </AccordionCard>
                    {!!children?.length && (
                        <AccordionTree header={parallelText}>
                            {renderAccordion(children, currentLevel, parallelLabel)}
                        </AccordionTree>
                    )}
                </Fragment>
            );
        });
    };

    return <div className="ms-action-log">{renderAccordion(renderTreeData)}</div>;
});
