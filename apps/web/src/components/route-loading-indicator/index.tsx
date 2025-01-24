import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import cls from 'classnames';
import { useInterval } from 'ahooks';
import { LinearProgress } from '@mui/material';
import './style.less';

// Initial progress
const INIT_PERCENT = 20;
// Steps per second
const PERCENT_STEP = 2;
// Time interval for progress change
const INTERVAL = 1000;

/**
 * Route load indicator
 */
const RouteLoadingIndicator = memo(() => {
    const { state } = useNavigation();
    const [timeInterval, setTimeInterval] = useState<number>();
    const [percent, setPercent] = useState<number | null>(null);
    const timer = useRef<number | null>(null);

    useInterval(
        () => {
            let value = percent === null ? INIT_PERCENT : percent + PERCENT_STEP;

            if (value >= 90) {
                value = 90;
            }

            setPercent(value);
        },
        timeInterval,
        { immediate: true },
    );

    useLayoutEffect(() => {
        switch (state) {
            case 'idle': {
                setPercent(100);
                setTimeInterval(undefined);
                timer.current && window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => {
                    setPercent(null);
                }, INTERVAL);
                break;
            }
            case 'loading': {
                setTimeInterval(INTERVAL);
                break;
            }
            default: {
                break;
            }
        }
    }, [state]);

    return (
        <div
            className={cls('ms-route-loading-indicator', {
                active: Number.isInteger(percent) && percent !== 100,
            })}
        >
            <LinearProgress variant="determinate" sx={{ height: 2 }} value={percent || 0} />
        </div>
    );
});

export default RouteLoadingIndicator;
