import { useRef, useMemo } from 'react';
import { type InjectedProps } from 'material-ui-popup-state';

/**
 * When hover to display a popover
 * delay the close of the popover when the mouse leave the trigger button
 * allow user to interact with the popover
 */
export default function usePopoverCloseDelay(props: {
    popupState: InjectedProps;
    /** Delay time set */
    wait?: number;
}) {
    const { popupState, wait = 100 } = props;

    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const bindTriggerLeave = useMemo(() => {
        return {
            onMouseLeave: () => {
                if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                }

                closeTimeoutRef.current = setTimeout(() => {
                    if (popupState.isOpen) {
                        popupState.close();
                    }
                }, wait);
            },
        };
    }, [popupState, wait]);

    const bindPopoverEnter = useMemo(() => {
        return {
            onMouseEnter: () => {
                if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                }
            },
        };
    }, []);

    return {
        /**
         * Delay the close of the popover
         */
        bindTriggerLeave,
        /** When mouse enter the popover, remove the close function */
        bindPopoverEnter,
    };
}
