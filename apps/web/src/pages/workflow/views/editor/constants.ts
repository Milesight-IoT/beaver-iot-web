/**
 * Minimum scaling ratio
 */
export const MIN_ZOOM = 0.25;

/**
 * Maximum scaling ratio
 */
export const MAX_ZOOM = 2;

/**
 * Parallel limit
 */
export const PARALLEL_LIMIT = 10;

/**
 * Parallel nesting layer limit
 */
export const PARALLEL_DEPTH_LIMIT = 3;

/**
 * Node minimum number limit
 */
export const NODE_MIN_NUMBER_LIMIT = 2;

/**
 * Entry node number limit
 */
export const ENTRY_NODE_NUMBER_LIMIT = 1;

/**
 * The addable Edge type
 */
export const EDGE_TYPE_ADDABLE: WorkflowEdgeType = 'addable';

/**
 * The default node width
 */
export const DEFAULT_NODE_WIDTH = 240;

/**
 * The default node height
 */
export const DEFAULT_NODE_HEIGHT = 48;

/**
 * Node X-axis spacing
 */
export const NODE_SPACING_X = 48;

/**
 * Node Y-axis spacing
 */
export const NODE_SPACING_Y = 48;

/**
 * Global parameter reference prefix
 */
export const PARAM_REFERENCE_PREFIX = '@';

/**
 * Global parameter reference pattern
 */
export const PARAM_REFERENCE_PATTERN = /^#\{([^{}]+)\}$/;

/**
 * Global parameter reference key divider
 */
export const PARAM_REFERENCE_DIVIDER = '.';

/**
 * Logic operator map
 */
export const logicOperatorMap: Partial<Record<WorkflowLogicOperator, { labelIntlKey: string }>> = {
    OR: {
        labelIntlKey: 'workflow.label.logic_keyword_or',
    },
    AND: {
        labelIntlKey: 'workflow.label.logic_keyword_and',
    },
};

/**
 * Condition operator map
 */
export const conditionOperatorMap: Partial<
    Record<WorkflowFilterOperator, { labelIntlKey: string }>
> = {
    CONTAINS: {
        labelIntlKey: 'workflow.label.condition_operator_contains',
    },
    NOT_CONTAINS: {
        labelIntlKey: 'workflow.label.condition_operator_not_contains',
    },
    START_WITH: {
        labelIntlKey: 'workflow.label.condition_operator_start_with',
    },
    END_WITH: {
        labelIntlKey: 'workflow.label.condition_operator_end_with',
    },
    EQ: {
        labelIntlKey: 'workflow.label.condition_operator_is',
    },
    NE: {
        labelIntlKey: 'workflow.label.condition_operator_is_not',
    },
    IS_EMPTY: {
        labelIntlKey: 'workflow.label.condition_operator_is_empty',
    },
    IS_NOT_EMPTY: {
        labelIntlKey: 'workflow.label.condition_operator_is_not_empty',
    },
};

/**
 * The node property keys that cannot be modified in advance mode and final data
 */
export const FROZEN_NODE_PROPERTY_KEYS: string[] = ['selected', 'dragging'];
