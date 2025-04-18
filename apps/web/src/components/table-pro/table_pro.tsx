import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isUndefined } from 'lodash-es';
import { OutlinedInput, InputAdornment, Popover, Button } from '@mui/material';
import {
    DataGrid,
    type DataGridProps,
    type GridValidRowModel,
    type GridColDef,
} from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';
import Tooltip from '../tooltip';
import { Footer, NoDataOverlay, NoResultsOverlay } from './components';
import { ColumnType, FilterValue } from './interface';
import { useFilterProps, useHeader } from './hook';

import './style.less';

export interface Props<T extends GridValidRowModel> extends DataGridProps<T> {
    /** table column */
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
     * toolbar sort
     */
    toolbarSort?: React.ReactNode;
}

/** The number of options per page is displayed by default */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/** Default paging model */
const DEFAULT_PAGINATION_MODEL = { page: 0, pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0] };

/**
 * Data form element
 */
const TablePro = <DataType extends GridValidRowModel>({
    columns,
    initialState,
    slots,
    slotProps,
    toolbarRender,
    toolbarSort,
    onSearch,
    onRefreshButtonClick,
    onFilterInfoChange,
    paginationMode = 'server',
    ...props
}: Props<DataType>) => {
    const { getIntlText } = useI18n();
    const { getColumnFilterProps } = useFilterProps();

    const { renderHeader } = useHeader({
        onFilterInfoChange,
        columns,
    });

    const memoColumns = useMemo(() => {
        const result = columns.map((column, index) => {
            const filterDropdown = column.filterSearchType
                ? getColumnFilterProps(column.filterSearchType)
                : {};

            const col = { ...column, ...filterDropdown };

            col.sortable = isUndefined(col.sortable) ? false : col.sortable;
            col.filterable = isUndefined(col.filterable) ? false : col.filterable;
            col.disableColumnMenu = isUndefined(col.disableColumnMenu)
                ? true
                : column.disableColumnMenu;

            if (columns.length === index + 1) {
                col.align = isUndefined(col.align) ? 'right' : col.align;
                col.headerAlign = isUndefined(col.headerAlign) ? 'right' : col.headerAlign;
                col.resizable = isUndefined(col.resizable) ? false : col.resizable;
            }
            /** has filter condition */
            if (col.filterDropdown || col.filters) {
                const originalRenderHeader = col.renderHeader;
                col.renderHeader = originalRenderHeader || (() => renderHeader(col));
            }

            if (col.ellipsis) {
                const originalRenderCell = col.renderCell;

                col.renderCell = (...args) => {
                    const { value } = args[0];
                    const title = originalRenderCell?.(...args) || value;

                    return (
                        <Tooltip
                            autoEllipsis
                            title={title || '-'}
                            slotProps={{
                                popper: {
                                    modifiers: [{ name: 'offset', options: { offset: [0, -20] } }],
                                },
                            }}
                        />
                    );
                };
            }

            return col;
        });

        return result as readonly GridColDef<DataType>[];
    }, [columns]);

    return (
        <div className="ms-table-pro">
            {!!(toolbarRender || onSearch || toolbarSort) && (
                <div className="ms-table-pro__header">
                    <div className="ms-table-pro__topbar-operations">{toolbarRender}</div>
                    {!!onSearch && (
                        <div className="ms-table-pro__topbar-search">
                            <OutlinedInput
                                placeholder="Search"
                                sx={{ width: 220 }}
                                onChange={e => onSearch?.(e.target.value)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                            />
                        </div>
                    )}
                    {!!toolbarSort && (
                        <div className="ms-table-pro__topbar-sort">{toolbarSort}</div>
                    )}
                </div>
            )}
            <div className="ms-table-pro__body">
                <DataGrid<DataType>
                    disableColumnSelector
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    sx={{ border: 0 }}
                    columnHeaderHeight={44}
                    rowHeight={48}
                    paginationMode={paginationMode}
                    pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                    columns={memoColumns}
                    initialState={{
                        pagination: { paginationModel: DEFAULT_PAGINATION_MODEL },
                        ...initialState,
                    }}
                    slots={{
                        noRowsOverlay: NoDataOverlay,
                        noResultsOverlay: NoResultsOverlay,
                        footer: Footer,
                        ...slots,
                    }}
                    slotProps={{
                        footer: {
                            // @ts-ignore
                            onRefreshButtonClick,
                        },
                        baseCheckbox: {
                            // disabled: true,
                            onDoubleClick(e) {
                                e.stopPropagation();
                            },
                        },
                        ...slotProps,
                    }}
                    {...props}
                />
            </div>
        </div>
    );
};

// export type { GridColDef as ColumnType };
export default TablePro;
