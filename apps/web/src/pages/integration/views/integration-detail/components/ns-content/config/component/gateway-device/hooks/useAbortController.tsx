import { useRef, useState } from 'react';

/**
 * Terminally requestable hooks
 */
export default function useAbortController() {
    const controller = useRef<AbortController>(new AbortController());
    const [isPending, setIsPending] = useState<boolean>(false);

    const startRequest = () => {
        if (isPending) {
            return null;
        }
        controller.current = new AbortController();
        setIsPending(true);
        return controller.current.signal;
    };

    const finishRequest = () => {
        setIsPending(false);
    };

    return {
        signal: controller.current.signal,
        startRequest,
        finishRequest,
        isPending,
    };
}
