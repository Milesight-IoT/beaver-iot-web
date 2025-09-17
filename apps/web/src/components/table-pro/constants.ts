/**
 * The cache key configured in the column
 */
export const COLUMNS_CACHE_KEY = 'columns';

/**
 * The prefix identifier of the key name in the operation column
 */
export const OPERATION_COLUMN_KEY_PREFIX = '$';

/**
 * Advanced filter operators
 */
export const FILTER_OPERATOR: Record<FilterOperatorType, { intlKey: string }> = {
    CONTAINS: {
        intlKey: 'workflow.label.condition_operator_contains',
    },
    NOT_CONTAINS: {
        intlKey: 'workflow.label.condition_operator_not_contains',
    },
    EQ: {
        intlKey: 'workflow.label.condition_operator_is',
    },
    NE: {
        intlKey: 'workflow.label.condition_operator_is_not',
    },
    ANY_EQUALS: {
        intlKey: 'common.label.condition_any_equal',
    },
    IS_EMPTY: {
        intlKey: 'workflow.label.condition_operator_is_empty',
    },
    IS_NOT_EMPTY: {
        intlKey: 'workflow.label.condition_operator_is_not_empty',
    },
    START_WITH: {
        intlKey: 'workflow.label.condition_operator_start_with',
    },
    END_WITH: {
        intlKey: 'workflow.label.condition_operator_end_with',
    },
};

/**
 * Operators object
 */
export const FILTER_OPERATORS: Record<FilterOperatorType, FilterOperatorType> = Object.keys(
    FILTER_OPERATOR,
).reduce(
    (acc: Record<FilterOperatorType, FilterOperatorType>, key: string) => {
        const operatorKey = key as FilterOperatorType;
        acc[operatorKey] = operatorKey;
        return acc;
    },
    {} as Record<FilterOperatorType, FilterOperatorType>,
);

/**
 * Get FilterOperator excludes by specified FilterOperator
 * @param excludes {FilterOperatorType[]}
 * @returns FilterOperatorType[]
 */
export const getOperatorsByExclude = (excludes: FilterOperatorType[]): FilterOperatorType[] => {
    return (Object.keys(FILTER_OPERATOR) as FilterOperatorType[]).filter(
        (operator: FilterOperatorType) => !excludes.includes(operator),
    );
};
