import React from 'react';
import { isObject } from 'lodash-es';
import cls from 'classnames';
import {
    IconButton,
    Box,
    Typography,
    Pagination,
    PaginationItem,
    PaginationProps,
    Select,
    MenuItem,
} from '@mui/material';
import {
    GridFooterContainer,
    gridPageCountSelector,
    gridPageSelector,
    gridPageSizeSelector,
    GridSlots,
    PropsFromSlot,
    useGridApiContext,
    useGridRootProps,
    useGridSelector,
} from '@mui/x-data-grid';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { RefreshIcon } from '@milesight/shared/src/components';

import './style.less';

/**
 * Custom Pagination by material ui Pagination
 * @returns
 */
const CustomPagination: React.FC<PaginationProps> = ({
    color = 'primary',
    variant = 'outlined',
    shape = 'rounded',
    renderItem,
    ...rest
}) => {
    const { matchTablet } = useTheme();

    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const { pageSizeOptions } = rootProps;
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const siblingCount = matchTablet ? 0 : undefined;
    const boundaryCount = matchTablet ? 0 : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <Pagination
                color={color}
                variant={variant}
                shape={shape}
                page={page + 1}
                count={pageCount}
                siblingCount={siblingCount}
                boundaryCount={boundaryCount}
                renderItem={props => {
                    return renderItem ? (
                        renderItem(props)
                    ) : (
                        <PaginationItem {...props} page={<span>{props.page}</span>} />
                    );
                }}
                onChange={(event, value) => {
                    apiRef.current.setPage(value - 1);
                }}
                {...rest}
            />
            {!matchTablet && (
                <Select
                    id="pagination-size"
                    label=""
                    MenuProps={{
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                        },
                        transformOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                        },
                        sx: { mt: -1 },
                    }}
                    sx={{
                        ml: 1,
                        height: 29,
                    }}
                    value={pageSize}
                    onChange={event => {
                        apiRef.current.setPageSize(Number(event.target.value));
                    }}
                    renderValue={(value: any) => {
                        const size:
                            | number
                            | {
                                  value: number;
                                  label: string;
                              }
                            | undefined = pageSizeOptions.find(
                            size => (isObject(size) ? size.value : size) === value,
                        );
                        return <span>{isObject(size) ? size.label : size}</span>;
                    }}
                >
                    {pageSizeOptions.map(size => {
                        return (
                            <MenuItem
                                key={isObject(size) ? size.value : size}
                                value={isObject(size) ? size.value : size}
                            >
                                {isObject(size) ? size.label : size}
                            </MenuItem>
                        );
                    })}
                </Select>
            )}
        </Box>
    );
};

type CustomFooterProps = PropsFromSlot<GridSlots['footer']> & {
    /** Refresh button click callback */
    onRefreshButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * Whether the selected and total numbers are displayed in the lower left corner
     */
    showSelectedAndTotal: boolean;
    /**
     * The total number of rows currently selected
     */
    selectedCount: number;
    /**
     * The total number that meets the search criteria
     */
    totalCount: number;
};

/**
 * Custom table footer components
 */
const CustomFooter: React.FC<CustomFooterProps> = ({
    onRefreshButtonClick,
    showSelectedAndTotal,
    selectedCount,
    totalCount,
    className,
    ...props
}) => {
    const { getIntlText } = useI18n();
    return (
        <GridFooterContainer className={cls('ms-table-pro__footer', className)} {...props}>
            <Box sx={{ display: 'flex' }}>
                <IconButton
                    size="small"
                    className="ms-table-pro__refresh-btn"
                    onClick={onRefreshButtonClick}
                >
                    <RefreshIcon sx={{ width: 20, height: 20 }} />
                </IconButton>
                {showSelectedAndTotal && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                        {!!selectedCount && (
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {getIntlText('common.label.selected')}: {selectedCount} ,
                            </Typography>
                        )}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {getIntlText('common.label.total_count')}: {totalCount}
                        </Typography>
                    </Box>
                )}
            </Box>
            <CustomPagination />
        </GridFooterContainer>
    );
};

export default CustomFooter;
