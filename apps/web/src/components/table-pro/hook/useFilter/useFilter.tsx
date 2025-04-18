import React, { useMemo, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { FilterValue, ColumnType, FilterState, FilterKey, SafeKey } from '../../interface';
import FilterDropdown from '../../components/filter-down/filterDown';

export interface FilterConfigProps {
    /** table columns */
    columns: ColumnType[];
    /** filter info change */
    onFilterInfoChange?: (
        filters: Record<string, FilterValue | null>,
        filterStates?: FilterState[],
    ) => void;
}

/**
 * table  column searchFilter
 */
const useFilter = (props: FilterConfigProps) => {
    const { onFilterInfoChange, columns } = props;

    /**
     * generate has search column
     */
    const collectFilterStates = useMemoizedFn((columns: ColumnType[]): FilterState[] => {
        const filterStates: FilterState[] = [];
        (columns || []).forEach((column, index) => {
            if (column.filters || 'filterSearchType' in column) {
                if ('filteredValue' in column) {
                    filterStates.push({
                        column,
                        key: column.field,
                        filteredKeys: column.filteredValue as unknown as FilterKey,
                    });
                }
            }
        });
        return filterStates;
    });

    /**
     * get filter info
     */
    const generateFilterInfo = useMemoizedFn((filterStates: FilterState[]) => {
        const currentFilters: Record<string, FilterValue | null> = {};
        filterStates.forEach(({ key, filteredKeys }) => {
            const keyAsString = key as SafeKey;
            currentFilters[keyAsString] = filteredKeys || null;
        });
        return currentFilters;
    });

    /**
     * all column search value
     * */
    const [filterStates, setFilterStates] = useState<FilterState[]>(() =>
        collectFilterStates(columns),
    );

    /**
     * merge column search value
     */
    const mergedFilterStates = useMemo(() => {
        return collectFilterStates(columns);
    }, [columns, filterStates]);

    /**
     * latest all filter info
     */
    const filters = useMemo(() => generateFilterInfo(mergedFilterStates), [mergedFilterStates]);

    /**
     * trigger filter info change
     */
    const triggerFilter = (filterState: FilterState) => {
        const newFilterStates = mergedFilterStates.filter(({ key }) => key !== filterState.key);
        newFilterStates.push(filterState);
        setFilterStates(newFilterStates);
        onFilterInfoChange?.(generateFilterInfo(newFilterStates), newFilterStates);
    };

    const renderHeader = (col: ColumnType): React.ReactNode => {
        const filterState = filterStates.find(({ key }) => col.field === key);
        return (
            <FilterDropdown column={col} filterState={filterState} triggerFilter={triggerFilter} />
        );
    };

    return [renderHeader, filters] as const;
};

export default useFilter;
