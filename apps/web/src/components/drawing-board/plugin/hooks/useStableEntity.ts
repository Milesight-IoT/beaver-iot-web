import { useState, useRef, useEffect } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Use stable entity
 * Update if changes occur, otherwise do not update.
 */
export function useStableEntity<T>(entity?: T[]) {
    const [stableEntity, setStableEntity] = useState<T[] | undefined>([]);

    const stableEntityRef = useRef<T[] | undefined>([]);

    useEffect(() => {
        stableEntityRef.current = stableEntity;
    }, [stableEntity]);

    useEffect(() => {
        if (isEqual(stableEntityRef.current, entity)) {
            return;
        }

        setStableEntity(entity);
    }, [entity]);

    return {
        /**
         * Update when entity changes occur, otherwise do not update.
         */
        stableEntity,
    };
}
