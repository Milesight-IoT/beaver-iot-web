import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

/**
 * 加载按钮组件
 */
const LoadingButton: React.FC<
    {
        loading?: boolean;
        indicatorColor?: 'primary' | 'secondary' | 'inherit';
    } & ButtonProps
> = ({ children, loading, disabled, indicatorColor = 'inherit', ...otherProps }) => {
    return (
        <Button disabled={disabled || loading === true || false} {...otherProps}>
            {loading && <CircularProgress size={16} color={indicatorColor} sx={{ mr: 1 }} />}
            {children}
        </Button>
    );
};

export default LoadingButton;
