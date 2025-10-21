import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CircularProgress, type CircularProgressProps, Box } from '@mui/material';

import './style.less';

export interface LoadingWrapperProps {
    /**
     * Additional class name of loading
     */
    className?: string;
    /** Whether Loading */
    loading?: boolean;
    /** style of wrapper */
    wrapperStyle?: React.CSSProperties;
    /** Style of loading */
    style?: React.CSSProperties;
    /**
     * Customize description content
     */
    tip?: React.ReactNode;
    /**
     * The className of wrapper loading
     */
    wrapperClassName?: string;
    /**
     * children of loading
     */
    children?: React.ReactNode;
    /**
     * the size of the loading
     */
    size?: number | string;
}

// Inspired by the former Facebook spinners.
function FacebookCircularProgress(props: CircularProgressProps) {
    return (
        <Box sx={{ position: 'relative', display: 'flex' }}>
            <CircularProgress
                variant="determinate"
                sx={{
                    color: 'transparent',
                }}
                size={40}
                {...props}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                sx={{
                    color: '#8e66ff',
                    animationDuration: '550ms',
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                    },
                }}
                size={40}
                {...props}
            />
        </Box>
    );
}

/**
 * Loading wrapper component
 */
const LoadingWrapper: React.FC<LoadingWrapperProps> = props => {
    const {
        className,
        wrapperClassName,
        loading,
        wrapperStyle,
        style,
        size = 40,
        tip,
        children,
    } = props;

    const loadingClassName = useMemo(() => {
        return classNames('ms-loading', className, {
            'ms-loading-processing': loading,
            'ms-loading-show-text': !!tip,
        });
    }, [className, loading, tip]);

    const containerClassName = useMemo(() => {
        return classNames('ms-loading-container', {
            'ms-loading-blur': loading,
        });
    }, [loading]);

    const loadingElement: React.ReactNode = (
        <div style={style} className={loadingClassName}>
            <div className="ms-loading__indicator">
                <FacebookCircularProgress size={size} />
                {tip && <div className="ms-loading__text">{tip}</div>}
            </div>
        </div>
    );

    return (
        <div style={wrapperStyle} className={classNames('ms-loading-wrapper', wrapperClassName)}>
            {loading && <div key="loading">{loadingElement}</div>}
            <div className={containerClassName} key="container">
                {children}
            </div>
        </div>
    );
};

export default LoadingWrapper;
