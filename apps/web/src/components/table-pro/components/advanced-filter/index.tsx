import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { isArray, isObject, unionBy } from 'lodash-es';
import classNames from 'classnames';
import {
    Badge,
    Box,
    Button,
    ButtonProps,
    IconButton,
    Popover,
    Tooltip,
    Typography,
} from '@mui/material';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { GridValidRowModel } from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import { camelToSnake } from '@milesight/shared/src/utils/tools';
import {
    AddIcon,
    CancelIcon,
    CloseIcon,
    FilterListOutlinedIcon,
} from '@milesight/shared/src/components';
import { ColumnType } from '../../types';
import { isOperationColumn } from '../../utils';
import {
    RowCondition,
    ConditionProps,
    FilterValueType,
    ValueComponentSlotProps,
    isNullValueOperator,
} from './components';
import { useSyncDynamic } from './hooks';

import './style.less';

export interface AdvancedFilterHandler {
    // Additional condition value
    appendConditionValue: (condition: ConditionProps) => void;
    // Delete conditions
    deleteConditions: (columns: string[]) => void;
    // Reset all condition
    resetConditions: () => void;
}

export type AdvancedFilterProps<T extends GridValidRowModel> = Omit<ButtonProps, 'ref'> & {
    columns: ColumnType<T>[];
    onChange: (filters: AdvancedConditionsType<T>) => void;
    /**
     * The value component slot can pass the props of components
     * @example
     *  valueComponentSlotProps={{
            baseSelect: Partial<SelectProps>,
            entityType: {
                multiple: false
            }
        }}
        
        valueComponentSlotProps={{
            entityType: {
                multiple: false
            }
        }}
     */
    compSlotProps?: ValueComponentSlotProps;
};

const EMPTY_DATA: ConditionProps = {
    column: '',
    operator: '' as FilterOperatorType,
    value: '',
    valueCompType: '',
};

/**
 * Table advanced filter
 */
const AdvancedFilter = <T extends GridValidRowModel>(
    props: AdvancedFilterProps<T>,
    ref: React.ForwardedRef<AdvancedFilterHandler>,
) => {
    const { columns, onChange, compSlotProps, className, ...rest } = props;
    const { getIntlText } = useI18n();

    const popupState = usePopupState({ variant: 'popover', popupId: 'advancedFilter' });
    const [isHover, setIsHover] = useState<boolean>(false);

    const {
        list: conditions,
        remove,
        getKey,
        insert,
        replace,
        resetList,
    } = useSyncDynamic<ConditionProps>([]);

    useImperativeHandle(ref, () => ({
        appendConditionValue: (condition: ConditionProps) => {
            const index = conditions.findIndex(c => c.column === condition.column);
            if (index >= 0) {
                const { value, operator } = conditions[index];
                handleFilterChange(
                    replace(index, {
                        ...condition,
                        operator: isNullValueOperator(operator) ? condition.operator : operator,
                        value:
                            isArray(value) && isArray(condition.value)
                                ? unionBy(value, condition.value, 'value')
                                : condition.value,
                    }),
                );
            } else {
                handleFilterChange(insert(conditions.length, condition));
            }
        },
        deleteConditions: (columns: string[]) => {
            const newConditions = conditions.filter(c => !columns.includes(c.column));
            handleFilterChange(resetList(newConditions));
        },
        resetConditions: resetFilter,
    }));

    useEffect(() => {
        // One condition is displayed by default
        if (!conditions.length && popupState.isOpen) {
            initDefaultCondition();
        }
    }, [popupState.isOpen]);

    /**
     * Display one default condition
     */
    const initDefaultCondition = () => {
        const firstCol = columns.find(c => !!c.operators?.length);
        if (firstCol) {
            insert(0, {
                column: firstCol.field,
                operator: firstCol.operators?.[0] as FilterOperatorType,
                value: '',
                valueCompType: firstCol?.operatorValueCompType || '',
            });
        }
    };

    /**
     * Clear the values of all conditions
     */
    const clearConditionsValue = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation();
        const newConditions = conditions.map(c => {
            return {
                ...c,
                operator: (isNullValueOperator(c.operator) ? '' : c.operator) as FilterOperatorType,
                value: (isArray(c.value) ? [] : '') as FilterValueType,
            };
        });
        handleFilterChange(resetList(newConditions));
        setIsHover(false);
    };

    const confirmFilter = () => {
        handleFilterChange(conditions);
        popupState.close();
    };

    const resetFilter = () => {
        handleFilterChange(resetList([]));
        initDefaultCondition();
        popupState.close();
    };

    /**
     * Filter out incomplete conditions
     * @param conditions
     */
    const filterTruthConditions = useCallback((conditions: ConditionProps[]) => {
        return conditions.filter(v => {
            if (isNullValueOperator(v.operator)) {
                return !!v.column;
            }
            return v.column && v.operator && (isArray(v.value) ? !!v.value.length : !!v.value);
        });
    }, []);

    /**
     * Convert the condition array to the condition object format
     * @param conditions
     */
    const handleFilterChange = (conditions: ConditionProps[]) => {
        const filters = Object.fromEntries(
            filterTruthConditions(conditions).map(condition => [
                camelToSnake(condition.column).toUpperCase(),
                {
                    operator: condition.operator,
                    values: wrapInArray(condition.value),
                },
            ]),
        ) as AdvancedConditionsType<T>;
        onChange(filters);
    };

    /**
     * Convert the incoming data into a form wrapped in []
     * @param value {FilterValueType}
     */
    const wrapInArray = (value: FilterValueType) => {
        if (isArray(value)) {
            return value.map(v => v.value);
        }
        if (isObject(value)) {
            return [value.value || ''];
        }
        return value ? [value] : [];
    };

    const conditionsCount = useMemo(() => {
        return filterTruthConditions(conditions).length;
    }, [conditions]);

    const disabledAdd = useMemo(() => {
        return conditions.length >= columns.filter(c => !!c.operators).length;
    }, [columns, conditions.length]);

    return (
        <div className="ms-advanced-filter">
            <Button
                className={classNames(className, {
                    'ms-advanced-filter-hover': popupState.isOpen,
                })}
                startIcon={<FilterListOutlinedIcon />}
                endIcon={
                    <Box>
                        {!!conditionsCount && (
                            <Badge
                                badgeContent={conditionsCount}
                                color="primary"
                                invisible={isHover}
                                onClick={clearConditionsValue}
                                onMouseEnter={() => setIsHover(true)}
                                onMouseLeave={() => setIsHover(false)}
                            >
                                <Typography variant="subtitle2">
                                    <Box sx={{ width: 20, height: 20 }}>
                                        <Tooltip
                                            title={getIntlText(
                                                'common.label.clear_filter_condition',
                                            )}
                                        >
                                            <CancelIcon color="primary" />
                                        </Tooltip>
                                    </Box>
                                </Typography>
                            </Badge>
                        )}
                    </Box>
                }
                {...rest}
                {...bindTrigger(popupState)}
            />
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div className="ms-advanced-filter-content">
                    <div>
                        <span>{getIntlText('entity.label.filter')}</span>
                        <IconButton
                            aria-label="close filter"
                            onClick={() => popupState.close()}
                            edge="end"
                        >
                            <CloseIcon sx={{ width: 20, height: 20 }} />
                        </IconButton>
                    </div>
                    <div className="ms-advanced-filter-content-wrap">
                        {conditions.map((item, index) => (
                            <RowCondition
                                key={getKey(index)}
                                index={index}
                                item={item}
                                conditions={conditions}
                                columns={columns}
                                compSlotProps={compSlotProps}
                                replace={replace}
                                remove={remove}
                            />
                        ))}
                    </div>
                    <div className="ms-advanced-filter-content-footer">
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            disabled={disabledAdd}
                            onClick={() => {
                                if (disabledAdd) {
                                    return;
                                }
                                insert(conditions.length, EMPTY_DATA);
                            }}
                        >
                            {getIntlText('workflow.editor.form_button_add_condition')}
                        </Button>
                        <div>
                            <Button variant="outlined" sx={{ mr: 1.5 }} onClick={resetFilter}>
                                {getIntlText('common.button.reset')}
                            </Button>
                            <Button variant="contained" onClick={confirmFilter}>
                                {getIntlText('common.label.search')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Popover>
        </div>
    );
};

export default forwardRef(AdvancedFilter) as <T extends GridValidRowModel>(
    props: React.PropsWithChildren<AdvancedFilterProps<T>> & {
        ref?: React.ForwardedRef<AdvancedFilterHandler>;
    },
) => React.ReactElement;
