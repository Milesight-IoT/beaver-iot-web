import React from 'react';
import { type GridValidRowModel, type GridColDef, DataGridProps } from '@mui/x-data-grid';
import { DateRangePickerValueType } from '../date-range-picker';

export type SafeKey = Exclude<React.Key, bigint>;
/**
 * FilterInfo key
 */
export type FilterValue = (React.Key | boolean)[];
export type FilterKey = React.Key[] | null;

/**
 * Filter component type
 */
export type FilterSearchType = 'search' | 'datePicker';

/** Table component props */
export interface TableProProps<T extends GridValidRowModel> extends DataGridProps<T> {
    /** Table column */
    columns: ColumnType<T>[];

    /**
     * Toolbar slot (Custom render Node on the left)
     */
    toolbarRender?: React.ReactNode;

    /** Search box input callback */
    onSearch?: (value: string) => void;

    /** Refresh button click callback */
    onRefreshButtonClick?: () => void;
    /**  filter info change */
    onFilterInfoChange?: (filters: Record<string, FilterValue | null>) => void;

    /**
     * Toolbar sort
     */
    toolbarSort?: React.ReactNode;
    /**
     * Table filter value by advanced filter or column header filter or general filter)
     */
    filterCondition?: string | Record<string, Key | boolean>;
    /**
     * Unique identifier, used for storing data such as column width and column display to local storage
     */
    tableName?: string;
    /**
     * Whether or not enable the column setting function
     * Note：It is essential to configure the tableName when enable
     */
    columnSetting?: boolean;
    /**
     * Whether to default to a show operation column in setting
     */
    settingShowOpeColumn?: boolean;
    /**
     * Whether the selected and total numbers are displayed in the lower left corner
     */
    showSelectedAndTotal?: boolean;
    /**
     * Customize toolbar search input component slot area position
     */
    searchSlot?: React.ReactNode;
    /**
     * Customize filter functions that are not displayed in the settings panel and table.
     * It is used for scenarios where columns within a table need to be dynamically displayed
     */
    filterSettingColumns?: (settingColumns: ColumnSettingProps<T>[]) => ColumnSettingProps<T>[];
}

/**
 * Table column type
 */
export type ColumnType<R extends GridValidRowModel = any, V = any, F = V> = GridColDef<R, V, F> & {
    /**
     * Whether the copy is automatically omitted
     */
    ellipsis?: boolean;
    /**
     * Column header filter icon
     */
    filterIcon?: React.ReactNode | ((filtered: boolean) => React.ReactNode);
    /**
     * Column header filter dropdown container
     */
    filterDropdown?:
        | React.ReactNode
        | ((FilterDropdownProps: FilterDropdownProps) => React.ReactNode);
    /**
     * Column header filtered value
     */
    filteredValue?: string;
    /**
     * Column header filter search type
     */
    filterSearchType?: FilterSearchType;
    /**
     * Column header filter array
     */
    filters?: {
        text: string;
        value: string | number;
    }[];
    /**
     * Column header dropdown component visible event
     */
    onFilterDropdownOpenChange?: (visible: boolean) => void;
    /**
     * Column fixed direction，It will take effect only when width or min width is configured
     */
    fixed?: 'left' | 'right';
    /**
     * Is hide column, It can be enabled through column setting
     */
    hidden?: boolean;
    /**
     * Filter operators, use in advanced filter
     */
    operators?: FilterOperatorType[];
    /**
     * The optional list function for obtaining values
     * @param keyword
     * @returns
     */
    operatorValues?: OperatorValuesType;
    /**
     * Filter value component type, use in advanced filter
     */
    operatorValueCompType?: ValueCompType;
};

// ====================== Advanced filter about ======================//

/** Operator input value type */
export type InputValueType = ApiKey;

/** Operator select value type */
export type SelectValueOptionType = {
    label: string;
    value: ApiKey;
};

/** Operator values options func  */
export type OperatorValuesType = (keyword?: string) => Promise<SelectValueOptionType[]>;

/**
 * Advanced filter value component type
 * @example
 * input： indicates the type of TextField
 * select： indicates the Autocomplete type
 * ''： indicates the type of TextField with disabled, such as being empty/not empty
 */
export type ValueCompType = 'input' | 'select' | '';

// ====================== Column setting about ======================//

/**
 * Column setting type
 */
export type ColumnSettingProps<T extends GridValidRowModel> = ColumnType<T> & {
    /**
     * Is column visible
     */
    checked?: boolean;
};

// ====================== Column header filter about ======================//

/**
 * Search keys type
 */
export type SelectKeysType = React.Key | DateRangePickerValueType;

/**
 * Column header Filter dropdown props
 */
export interface FilterDropdownProps {
    setSelectedKeys: (selectedKeys: SelectKeysType[]) => void;
    selectedKeys: SelectKeysType[];
    confirm: () => void;
    clearFilters: () => void;
    visible: boolean;
}

/**
 * Column header Filter state type
 */
export interface FilterState {
    column: ColumnType;
    key: React.Key;
    filteredKeys?: FilterKey;
}

/**
 * Column header Filter value type
 */
export type FiltersRecordType = Record<string, FilterValue | null>;

/**
 * Column header Filter etc info change event
 */
export interface ChangeEventInfo {
    filters: FiltersRecordType;
}

/**
 * Column header Column filters type
 */
export interface ColumnFilterItem {
    text: React.ReactNode;
    value: React.Key | boolean;
    children?: ColumnFilterItem[];
}

/**
 * The conditions after advanced filtering transformation
 */
declare type AdvancedConditionsType<T> = Partial<{
    [key in keyof T as Uppercase<key & string>]: {
        operator: FilterOperatorType;
        values: T[key][];
    };
}>;
