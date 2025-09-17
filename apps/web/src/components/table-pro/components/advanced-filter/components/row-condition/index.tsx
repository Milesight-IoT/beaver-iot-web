import { IconButton } from '@mui/material';
import { GridValidRowModel } from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import { CancelIcon, Select } from '@milesight/shared/src/components';
import { ColumnType, ValueCompType } from '../../../../types';
import { FILTER_OPERATORS } from '../../../../constants';
import { DynamicValueComp, ValueComponentSlotProps, FilterValueType } from '../value-comp';
import { useRowCondition } from './hooks';

/**
 * Row conditions
 */
export interface ConditionProps {
    column: string;
    operator: FilterOperatorType;
    value: FilterValueType;
    valueCompType: ValueCompType;
}

export interface RowConditionProps<T extends GridValidRowModel> {
    index: number;
    item: ConditionProps;
    /**
     * The set of selected conditions
     */
    conditions: ConditionProps[];
    /**
     * Table columns
     */
    columns: ColumnType<T>[];
    /**
     * Value component attribute slotProps
     */
    compSlotProps?: ValueComponentSlotProps;
    replace: (index: number, item: ConditionProps) => void;
    remove: (index: number) => void;
}

/**
 * Determine whether it is empty/not empty filter operator to
 * @param operator FilterOperatorType
 * @returns boolean
 */
export const isNullValueOperator = (operator: FilterOperatorType) => {
    return [FILTER_OPERATORS.IS_EMPTY, FILTER_OPERATORS.IS_NOT_EMPTY].includes(operator);
};

/**
 * Advanced filter filter row condition
 */
const RowCondition = <T extends GridValidRowModel>(props: RowConditionProps<T>) => {
    const { index, item, columns, conditions, compSlotProps, replace, remove } = props;

    const { getIntlText } = useI18n();

    const { columnInfo, optionsColumns, optionsOperators, operatorValues, getAutoFillRule } =
        useRowCondition({
            currentColumn: item.column,
            columns,
            usedColumns: conditions.map(row => row.column),
        });

    return (
        <div className="ms-advanced-filter-content-wrap-item">
            <Select
                sx={{ width: 160 }}
                placeholder={getIntlText('common.placeholder.select')}
                options={optionsColumns}
                value={item.column}
                onChange={e => {
                    const col = e?.target?.value;
                    const [operator, valueCompType] = getAutoFillRule(col, item.operator);
                    replace(index, {
                        column: col,
                        operator,
                        value: col !== item.column ? '' : item.value,
                        valueCompType,
                    });
                }}
            />
            <Select
                sx={{ width: 125 }}
                placeholder={getIntlText('common.placeholder.select')}
                options={optionsOperators}
                value={item.operator}
                onChange={e => {
                    const operator = e?.target?.value as FilterOperatorType;
                    replace(index, {
                        ...item,
                        operator,
                        value: isNullValueOperator(operator) ? '' : item.value,
                        valueCompType: isNullValueOperator(operator)
                            ? ''
                            : columnInfo[item.column].valueCompType!,
                    });
                }}
            />
            <DynamicValueComp
                value={item.value}
                column={item.column}
                onChange={value => {
                    replace(index, {
                        ...item,
                        value,
                    });
                }}
                operatorValues={operatorValues}
                valueCompType={item.valueCompType}
                compSlotProps={compSlotProps}
            />
            <div className="ms-advanced-filter-content-wrap-item-delete">
                <IconButton onClick={() => remove(index)}>
                    <CancelIcon sx={{ width: 18, height: 18 }} />
                </IconButton>
            </div>
        </div>
    );
};

export default RowCondition;
