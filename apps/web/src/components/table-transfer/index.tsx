import React from 'react';
import { Button } from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon } from '@milesight/shared/src/components';

import { type GridValidRowModel } from '@mui/x-data-grid';
import { type TableProProps } from '../table-pro';
import { TableLeft, TableRight } from './components';
import { useTransfer } from './hooks';

import './style.less';

export interface TableTransferProps<T extends GridValidRowModel> {
    onChange: (values: T[]) => void;
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
    /**
     * on time sort change callbacks
     */
    onTimeSort?: (sort: SortType) => void;
    tableProps: TableProProps<T>;
}

/**
 * Table Transfer component
 */
const TableTransfer = <T extends GridValidRowModel>(props: TableTransferProps<T>) => {
    const { onChange, selectedFilter, sortField, showTimeSort, tableProps, onTimeSort } = props;
    const { rows, getRowId } = tableProps || {};

    const {
        left,
        right,
        leftCheckedIds,
        setLeftCheckedIds,
        rightCheckedIds,
        setRightCheckedIds,
        handleCheckedLeft,
        handleCheckedRight,
        notMovedLeftChecked,
    } = useTransfer<T>({
        rows,
        getRowId,
        onChange,
    });

    return (
        <div className="ms-table-transfer">
            <div className="ms-table-transfer__list">
                <TableLeft<T>
                    leftRows={left}
                    notMovedLeftChecked={notMovedLeftChecked}
                    leftCheckedIds={leftCheckedIds}
                    rightRows={right}
                    setLeftCheckedIds={setLeftCheckedIds}
                    tableProps={tableProps}
                    showTimeSort={showTimeSort}
                    onTimeSort={onTimeSort}
                />
            </div>
            <div className="ms-table-transfer__operation">
                <Button
                    variant="contained"
                    disabled={Boolean(!rightCheckedIds?.length)}
                    sx={{ width: 32, minWidth: 32 }}
                    onClick={handleCheckedLeft}
                >
                    <ChevronLeftIcon />
                </Button>
                <Button
                    variant="contained"
                    disabled={Boolean(notMovedLeftChecked?.length === 0)}
                    sx={{ width: 32, minWidth: 32 }}
                    onClick={handleCheckedRight}
                >
                    <ChevronRightIcon />
                </Button>
            </div>
            <div className="ms-table-transfer__list">
                <TableRight<T>
                    tableProps={tableProps}
                    rightRows={right}
                    rightCheckedIds={rightCheckedIds}
                    setRightCheckedIds={setRightCheckedIds}
                    selectedFilter={selectedFilter}
                    sortField={sortField}
                    showTimeSort={showTimeSort}
                />
            </div>
        </div>
    );
};

export default TableTransfer;
