import React, { useEffect, useMemo, useState } from 'react';
import { isArray, isObject, isUndefined, isNil } from 'lodash-es';
import cls from 'classnames';
import { useDebounceEffect } from 'ahooks';
import { OutlinedInput, InputAdornment } from '@mui/material';
import { DataGrid, type GridValidRowModel, useGridApiRef } from '@mui/x-data-grid';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';
import Tooltip from '../tooltip';
import { useFilterProps, useHeader, usePinnedColumn, useColumnsCacheKey } from './hook';
import { ColumnsSetting, Footer, NoDataOverlay, NoResultsOverlay } from './components';
import type { TableProProps, ColumnSettingProps } from './types';

import './style.less';

/** The number of options per page is displayed by default */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

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
    tableName,
    columnSetting = false,
    pageSizeOptions,
    settingShowOpeColumn = false,
    showSelectedAndTotal = true,
    filterSettingColumns,
    sx,
    searchSlot,
    ...props
}: TableProProps<DataType>) => {
    const { getIntlText } = useI18n();
    const { matchMobile } = useTheme();

    const apiRef = useGridApiRef();
    const { getCacheKey } = useColumnsCacheKey(tableName);
    const columnsDisplayCacheKey = getCacheKey('display');
    const columnsWidthCacheKey = getCacheKey('width');

    const { getColumnFilterProps } = useFilterProps();
    const { renderHeader } = useHeader({
        onFilterInfoChange,
        columns,
    });

    const paginationConfig = useMemo(() => {
        const pageSizeOption = (
            isObject(pageSizeOptions?.[0])
                ? pageSizeOptions
                : ((pageSizeOptions as number[]) || DEFAULT_PAGE_SIZE_OPTIONS).map(
                      (size: number) => ({
                          value: size,
                          label: `${size} / ${getIntlText('common.label.page')}`,
                      }),
                  )
        ) as ReadonlyArray<{ value: number; label: string }>;
        return {
            pageSizeOptions: pageSizeOption,
            paginationModel: { page: 0, pageSize: pageSizeOption[0].value },
        };
    }, [getIntlText, pageSizeOptions]);

    // If the search conditions change (such as advanced filter, fuzzy search, etc.),
    // the selected ones need to be reset
    useDebounceEffect(
        () => {
            apiRef.current.setRowSelectionModel([]);
        },
        [JSON.stringify(props.filterCondition)],
        {
            wait: 200,
        },
    );

    /**
     * Column Settings will not be displayed when the window size is less than a certain value
     */
    useDebounceEffect(
        () => {
            if (matchMobile) {
                setResultColumns(columns);
            }
        },
        [matchMobile],
        {
            wait: 100,
        },
    );

    const [resultColumns, setResultColumns] = useState<ColumnSettingProps<DataType>[]>(columns);
    const { pinnedColumnPos, columnsFixedClass, sortGroupByFixed } = usePinnedColumn({
        apiRef,
        columns: resultColumns,
        restProps: props,
    });

    const columnSettingEnable = useMemo(() => {
        return !matchMobile && columnSetting;
    }, [matchMobile, columnSetting]);

    /**
     * Column display or width or fixed change event
     */
    const handleColumnSettingChange = (newColumns: ColumnSettingProps<DataType>[]) => {
        setResultColumns(newColumns);
    };

    const memoColumns = useMemo(() => {
        const result = (
            columnSettingEnable ? resultColumns.filter(col => col.checked) : columns
        ).map((column, index) => {
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
                col.renderHeader = col.renderHeader || (() => renderHeader(col));
            }
            col.headerClassName = cls(
                col.headerClassName,
                pinnedColumnPos[col.field]?.headerClassName,
            );
            col.cellClassName = cls(col.cellClassName, pinnedColumnPos[col.field]?.cellClassName);

            if (col.ellipsis) {
                const originalRenderCell = col.renderCell;

                col.renderCell = (...args) => {
                    const { value } = args[0];
                    const title = originalRenderCell?.(...args) || value;

                    return (
                        <Tooltip
                            autoEllipsis
                            title={isNil(title) || title === '' ? '-' : title}
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

        return sortGroupByFixed(result);
    }, [columns, resultColumns, pinnedColumnPos]);

    return (
        <div className="ms-table-pro">
            {!!(toolbarRender || onSearch || toolbarSort || columnSettingEnable) && (
                <div className="ms-table-pro__header">
                    <div className="ms-table-pro__topbar-operations">{toolbarRender}</div>
                    {!!onSearch && (
                        <div className="ms-table-pro__topbar-search">
                            <OutlinedInput
                                placeholder={getIntlText('common.label.search')}
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
                    {searchSlot}
                    {columnSettingEnable && (
                        <ColumnsSetting<DataType>
                            apiRef={apiRef}
                            columns={columns}
                            columnsDisplayCacheKey={columnsDisplayCacheKey}
                            columnsWidthCacheKey={columnsWidthCacheKey}
                            onChange={handleColumnSettingChange}
                            settingShowOpeColumn={settingShowOpeColumn}
                            filterSettingColumns={filterSettingColumns}
                        />
                    )}
                    {!!toolbarSort && (
                        <div className="ms-table-pro__topbar-sort">{toolbarSort}</div>
                    )}
                </div>
            )}
            <div className="ms-table-pro__body">
                <DataGrid<DataType>
                    apiRef={apiRef}
                    disableColumnSelector
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                    sx={{
                        border: 0,
                        ...columnsFixedClass,
                        ...sx,
                    }}
                    columnHeaderHeight={44}
                    rowHeight={48}
                    paginationMode={paginationMode}
                    pageSizeOptions={paginationConfig.pageSizeOptions}
                    columns={memoColumns}
                    initialState={{
                        pagination: { paginationModel: paginationConfig.paginationModel },
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
                            showSelectedAndTotal,
                            selectedCount: isArray(props.rowSelectionModel)
                                ? props.rowSelectionModel?.length
                                : 0,
                            totalCount: props.rowCount || 0,
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
