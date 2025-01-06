import React from 'react';
import { ConfirmDialog } from './confirm-dialog';
import { ConfirmOptions, FinalOptions, GlobalOptions, HandleConfirm } from './types';
import { handleOverrideOptions } from './default-options';
import { useTimer } from './useTimer';

interface Props extends GlobalOptions {
    children?: React.ReactNode;
}

export const ConfirmContext = React.createContext<HandleConfirm | null>(null);

export const ConfirmProvider: React.FC<Props> = ({ children, ...globalOptions }) => {
    const [promise, setPromise] = React.useState<{
        resolve?: (value?: any) => void;
        reject?: () => void;
    }>({});

    const [finalOptions, setFinalOptions] = React.useState<FinalOptions>({});
    const [timerProgress, setTimerProgress] = React.useState(0);
    const [timerIsRunning, setTimerIsRunning] = React.useState(false);

    const timer = useTimer({
        onTimeEnd: () => handleCancel(),
        onTimeTick: timeLeft => setTimerProgress((100 * timeLeft) / finalOptions.timer!),
    });

    const confirm = React.useCallback(
        (confirmOptions?: ConfirmOptions) => {
            return new Promise<void>((resolve, reject) => {
                const finalOptions = handleOverrideOptions(globalOptions, confirmOptions);
                setFinalOptions(finalOptions);
                setPromise({ resolve, reject });

                if (finalOptions?.timer) {
                    setTimerIsRunning(true);
                    timer.start(finalOptions.timer);
                }
            });
        },
        [globalOptions, timer],
    );

    const handleStopTimer = React.useCallback(() => {
        if (timerIsRunning) {
            setTimerIsRunning(false);
            setTimerProgress(0);
            timer.stop();
        }
    }, [timerIsRunning, timer]);

    const handleResolveAndClear = React.useCallback(() => {
        promise?.resolve?.();
        setPromise({});
    }, [promise]);

    const handleRejectAndClear = React.useCallback(
        (disableClose?: boolean) => {
            promise?.reject?.();
            if (disableClose) return;
            setPromise({});
        },
        [promise],
    );

    const handleClose = React.useCallback(() => {
        handleStopTimer();
        handleResolveAndClear();
    }, [handleResolveAndClear, handleStopTimer]);

    const handleConfirm = React.useCallback(async () => {
        try {
            handleStopTimer();

            await finalOptions?.onConfirm?.();
            handleResolveAndClear();
        } catch (error) {
            handleRejectAndClear(Boolean(finalOptions?.confirmText));
            throw new Error(JSON.stringify(error));
        }
    }, [handleResolveAndClear, handleRejectAndClear, finalOptions, handleStopTimer]);

    const handleCancel = React.useCallback(() => {
        handleStopTimer();
        if (finalOptions?.rejectOnCancel) return handleRejectAndClear();
        handleResolveAndClear();
    }, [handleResolveAndClear, handleRejectAndClear, finalOptions, handleStopTimer]);

    return (
        <>
            <ConfirmContext.Provider value={confirm}>{children}</ConfirmContext.Provider>
            <ConfirmDialog
                show={Object.keys(promise).length === 2}
                progress={timerProgress}
                onCancel={handleCancel}
                onClose={handleClose}
                onConfirm={handleConfirm}
                finalOptions={finalOptions}
            />
        </>
    );
};
