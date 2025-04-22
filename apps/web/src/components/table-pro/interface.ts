import React from 'react';
import { type GridValidRowModel, type GridColDef } from '@mui/x-data-grid';
import { DateRangePickerValueType } from '../date-range-picker';

export type Key = React.Key;
export type SafeKey = Exclude<Key, bigint>;
/**
 * filterInfo key
 */
export type FilterValue = (Key | boolean)[];
export type FilterKey = Key[] | null;

/**
 * filter component type
 */
export type FilterSearchType = 'search' | 'datePicker';

/**
 * table column type
 */
export type ColumnType<R extends GridValidRowModel = any, V = any, F = V> = GridColDef<R, V, F> & {
    /**
     * Whether the copy is automatically omitted
     */
    ellipsis?: boolean;
    /**
     * filter icon
     */
    filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
    /**
     * filter dropdown container
     */
    filterDropdown?:
        | React.ReactNode
        | ((FilterDropdownProps: FilterDropdownProps) => React.ReactNode);
    /**
     * filtered value
     */
    filteredValue?: string;
    /**
     * search type
     */
    filterSearchType?: FilterSearchType;
    /**
     * filter array
     */
    filters?: {
        text: string;
        value: string | number;
    }[];
    /**
     * dropdown component visible event
     */
    onFilterDropdownOpenChange?: (visible: boolean) => void;
};

/**
 * search keys type
 */
export type SelectKeysType = React.Key | DateRangePickerValueType;

/**
 * filter dropdown props
 */
export interface FilterDropdownProps {
    setSelectedKeys: (selectedKeys: SelectKeysType[]) => void;
    selectedKeys: SelectKeysType[];
    confirm: () => void;
    clearFilters: () => void;
    visible: boolean;
}

/**
 * FilterState type
 */
export interface FilterState {
    column: ColumnType;
    key: Key;
    filteredKeys?: FilterKey;
}

/**
 * filter value type
 */
export type FiltersRecordType = Record<string, FilterValue | null>;

/**
 * filter etc info change event
 */
export interface ChangeEventInfo {
    filters: FiltersRecordType;
}

/**
 * column filters type
 */
export interface ColumnFilterItem {
    text: React.ReactNode;
    value: React.Key | boolean;
    children?: ColumnFilterItem[];
}
