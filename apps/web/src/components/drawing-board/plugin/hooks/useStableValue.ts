import { useState, useRef, useEffect } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Use stable value,
 * Update if changes occur, otherwise do not update,
 * Compare by isEqual
 */
export function useStableValue<T>(value?: T) {
    const [stableValue, setStableValue] = useState<T | undefined>();

    const stableValueRef = useRef<T | undefined>();

    useEffect(() => {
        if (isEqual(stableValueRef.current, value)) {
            return;
        }

        stableValueRef.current = value;
        setStableValue(value);
    }, [value]);

    return {
        /**
         * Update when value changes occur, compare by isEqual, otherwise do not update.
         */
        stableValue,
    };
}
