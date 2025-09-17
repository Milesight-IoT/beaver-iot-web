import { useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

export function useAddProgress() {
    /** Batch add device list completed */
    const [addCompleted, setAddCompleted] = useState(false);
    /** Batch add device list loop end */
    const [addLoopEnd, setAddLoopEnd] = useState(false);
    const [isInterrupting, setIsInterrupting] = useState(false);

    const interrupt = useRef<boolean>(false);

    const handleAddLoopEnd = useMemoizedFn(() => {
        setAddLoopEnd(true);
    });

    const handleAddCompleted = useMemoizedFn(() => {
        setAddCompleted(true);
    });

    /**
     * To interrupt the add request list
     */
    const interruptAddList = useMemoizedFn(() => {
        setIsInterrupting(true);
        interrupt.current = true;
    });

    return {
        addCompleted,
        handleAddCompleted,
        addLoopEnd,
        handleAddLoopEnd,
        /**
         * Interrupt Ref
         */
        interrupt,
        /**
         * To interrupt the add request list
         */
        interruptAddList,
        /** Add device interrupting */
        isInterrupting,
    };
}
