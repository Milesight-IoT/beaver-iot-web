import React, { useState, useEffect, useMemo } from 'react';

import { type GridValidRowModel } from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';

import TablePro, { type TableProProps } from '../../../table-pro';
import TableSort from '../table-sort';

export interface TableRightProps<T extends GridValidRowModel> {
    tableProps: TableProProps<T>;
    rightRows: readonly T[];
    rightCheckedIds: readonly ApiKey[];
    setRightCheckedIds: React.Dispatch<React.SetStateAction<readonly ApiKey[]>>;
    /**
     * Methods for filtering selected data
     */
    selectedFilter?: (keyword: string, row: T) => boolean;
    /**
     * table default top bar sort field
     */
    sortField?: string;
    /**
     * show time sort
     */
    showTimeSort?: boolean;
}

/**
 * Table left component
 */

export const TableRight = <T extends GridValidRowModel>(props: TableRightProps<T>) => {
    const {
        tableProps,
        rightRows,
        rightCheckedIds,
        setRightCheckedIds,
        selectedFilter,
        sortField = 'createdAt',
        showTimeSort,
    } = props;
    const { columns, getRowId } = tableProps || {};

    const { getIntlText } = useI18n();

    const [keyword, setKeyword] = useState<string>('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [searchRows, setSearchRows] = useState<T[]>();
    const [sort, setSort] = useState<SortType>();

    /**
     * filter selected data by keyword
     */
    useEffect(() => {
        if (keyword) {
            const filteredRows = rightRows.filter(row => selectedFilter?.(keyword, row) ?? true);
            setSearchRows(filteredRows);
        } else {
            setSearchRows(undefined);
        }
    }, [keyword, rightRows, selectedFilter]);

    /**
     * return sorted rows
     */
    const sortedRightRows = useMemo(() => {
        const originalRows = searchRows || rightRows;
        const newRows = [...originalRows];

        if (!sort || !sortField) {
            return newRows;
        }

        if (sort === 'ASC') {
            return newRows.sort((a, b) => {
                return a[sortField] - b[sortField];
            });
        }

        return newRows.sort((a, b) => b[sortField] - a[sortField]);
    }, [sort, sortField, rightRows, searchRows]);

    const renderTopBar = () => {
        return (
            <div className="ms-table-transfer__statistics">
                <div className="ms-table-transfer__statistics-title">
                    {getIntlText('common.label.chosen')}
                </div>
                <div className="ms-table-transfer__statistics-value">
                    {rightCheckedIds.length}/{rightRows.length}{' '}
                    {getIntlText('common.label.selected')}
                </div>
            </div>
        );
    };

    return (
        <TablePro<T>
            checkboxSelection
            showSelectedAndTotal={false}
            toolbarRender={renderTopBar()}
            toolbarSort={showTimeSort ? <TableSort onOperation={setSort} /> : undefined}
            columns={columns}
            getRowId={getRowId}
            rows={sortedRightRows}
            paginationModel={paginationModel}
            rowSelectionModel={rightCheckedIds}
            onPaginationModelChange={setPaginationModel}
            onRowSelectionModelChange={setRightCheckedIds}
            onSearch={setKeyword}
            paginationMode="client"
            onRefreshButtonClick={() =>
                setPaginationModel({
                    page: 0,
                    pageSize: 10,
                })
            }
        />
    );
};

export default TableRight;
