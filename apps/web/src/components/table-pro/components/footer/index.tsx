import React from 'react';
import { IconButton } from '@mui/material';
import {
    GridFooterContainer,
    GridPagination,
    type GridFooterContainerProps,
} from '@mui/x-data-grid';
import cls from 'classnames';
import { RefreshIcon } from '@milesight/shared/src/components';
import './style.less';

interface CustomFooterProps extends GridFooterContainerProps {
    /** Refresh button click callback */
    onRefreshButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * Custom table footer components
 */
const CustomFooter: React.FC<CustomFooterProps> = ({
    onRefreshButtonClick,
    className,
    ...props
}) => {
    return (
        <GridFooterContainer className={cls('ms-table-pro__footer', className)} {...props}>
            <IconButton
                size="small"
                className="ms-table-pro__refresh-btn"
                onClick={onRefreshButtonClick}
            >
                <RefreshIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
            <GridPagination
                className="ms-table-pro__pagination"
                slotProps={{
                    select: {
                        MenuProps: {
                            className: 'ms-table-pro__pagination-select',
                            anchorOrigin: { vertical: 'top', horizontal: 'left' },
                            transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                        },
                    },
                }}
            />
        </GridFooterContainer>
    );
};

export default CustomFooter;
