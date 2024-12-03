import React from 'react';
import { UseTimerProps } from './types';

const useTimerConfig = {
    step: 1,
    interval: 100,
};

type TimerState = {
    timer: number;
    startTime: number;
    elapsedTime: number;
    status: 'RUNNING' | 'IDLE';
};

const initialTimerState: TimerState = {
    timer: 0,
    startTime: 0,
    elapsedTime: 0,
    status: 'IDLE',
};

export const useTimer = (props?: UseTimerProps) => {
    const [timer, setTimer] = React.useState<TimerState>(initialTimerState);

    const handleStopTimer = () => {
        setTimer(initialTimerState);
    };

    const start = React.useCallback(
        (initialTime: number) => {
            if (initialTime && timer.status === 'IDLE') {
                const startTime = Date.now();
                setTimer({
                    startTime,
                    elapsedTime: 0,
                    timer: initialTime,
                    status: 'RUNNING',
                });
            }
        },
        [timer.status],
    );

    React.useEffect(() => {
        if (timer.status === 'RUNNING') props?.onTimeTick?.(timer.timer - timer.elapsedTime);

        if (timer.elapsedTime >= timer.timer && timer.status === 'RUNNING') {
            handleStopTimer();
            props?.onTimeEnd?.();
        }
    }, [timer]);

    React.useEffect(() => {
        let interval: number | null = null;

        if (timer.status === 'RUNNING') {
            const { startTime, ...otherProps } = timer;
            interval = window.setInterval(() => {
                setTimer({
                    ...otherProps,
                    startTime,
                    elapsedTime: Date.now() - startTime,
                });
            }, useTimerConfig.interval);
        } else if (timer.status === 'IDLE' && interval) {
            window.clearInterval(interval);
        }

        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [timer]);

    return { start, stop: handleStopTimer };
};
