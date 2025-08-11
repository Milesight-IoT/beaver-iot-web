import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { GridValidRowModel } from '@mui/x-data-grid';
import { FILTER_OPERATOR } from '../../../../../constants';
import { isOperationColumn } from '../../../../../utils';
import { ColumnType, ValueCompType, OperatorValuesType } from '../../../../../types';

/**
 * Column filtering information objects
 */
export interface OperatorColumnInfoType {
    column: ColumnType['field'];
    headerName: ColumnType['headerName'];
    operators?: FilterOperatorType[];
    operatorValues?: OperatorValuesType;
    valueCompType?: ValueCompType;
}

export interface useRowConditionProps<T extends GridValidRowModel> {
    /** Table columns */
    columns: ColumnType<T>[];
    /**
     * Columns that have been used
     */
    usedColumns: ColumnType<T>['field'][];
    /**
     * The currently selected column
     */
    currentColumn: ColumnType<T>['field'];
}

/**
 * Row condition hook
 */
const useRowCondition = <T extends GridValidRowModel>(props: useRowConditionProps<T>) => {
    const { currentColumn, columns, usedColumns } = props;

    const { getIntlText } = useI18n();

    /**
     * Column filter setting info
     */
    const columnInfo = useMemo(() => {
        const operatorColumns = columns.filter(
            col => !!col.operators?.length && !isOperationColumn(col.field),
        );
        return operatorColumns.reduce(
            (acc: Record<string, OperatorColumnInfoType>, column: ColumnType) => {
                acc[column.field] = {
                    column: column.field,
                    headerName: column.headerName,
                    operators: column.operators,
                    valueCompType: column.operatorValueCompType,
                    operatorValues: column.operatorValues,
                };
                return acc;
            },
            {} as Record<string, OperatorColumnInfoType>,
        );
    }, [columns]);

    const optionsColumns = useMemo(() => {
        return Object.keys(columnInfo)
            .filter(
                col =>
                    !(
                        currentColumn ? usedColumns.filter(c => c !== currentColumn) : usedColumns
                    ).includes(col),
            )
            .map(
                col => ({ label: columnInfo[col].headerName, value: col }) as OptionsProps<string>,
            );
    }, [currentColumn, usedColumns, columnInfo]);

    const optionsOperators = useMemo(() => {
        return (columnInfo[currentColumn]?.operators || []).map(opr => {
            return {
                label: getIntlText(FILTER_OPERATOR[opr].intlKey),
                value: opr,
            } as OptionsProps<string>;
        });
    }, [currentColumn, columnInfo, getIntlText]);

    const operatorValues = useMemo(() => {
        return columnInfo[currentColumn]?.operatorValues;
    }, [currentColumn, columnInfo]);

    /**
     * Automatically fill in/switch operators and component types based on the selected columns and conditions
     * If useSame is true, the same operator as the previous column will be used
     * (if the new column supports the operator), otherwise the first operator of the new column will be used.
     * @param column {string}
     * @param oldOperator {FilterOperatorType}
     * @param useSame {boolean}
     * @returns [operator, valueCompType]
     */
    const getAutoFillRule = (
        column: string,
        oldOperator: FilterOperatorType,
        useSame: boolean = false,
    ): [FilterOperatorType, ValueCompType] => {
        let operator = '';
        if (useSame && (columnInfo[column]?.operators || []).includes(oldOperator)) {
            operator = oldOperator;
        } else {
            operator = columnInfo[column]?.operators?.[0] || '';
        }
        return [operator as FilterOperatorType, operator ? columnInfo[column].valueCompType! : ''];
    };

    return {
        columnInfo,
        optionsColumns,
        optionsOperators,
        operatorValues,
        getAutoFillRule,
    };
};

export default useRowCondition;
