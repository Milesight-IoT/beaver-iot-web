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
    /** 刷新按钮点击回调 */
    onRefreshButtonClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * 自定义表格页脚组件
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
                <RefreshIcon sx={{ width: 24, height: 24 }} />
            </IconButton>
            <GridPagination
                className="ms-table-pro__pagination"
                slotProps={{
                    select: {
                        MenuProps: {
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
