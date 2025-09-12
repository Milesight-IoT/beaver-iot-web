import { useState, useRef, useEffect } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Use stable entity,
 * Update if changes occur, otherwise do not update,
 * Compare by isEqual
 */
export function useStableEntity<T>(entity?: T[]) {
    const [stableEntity, setStableEntity] = useState<T[] | undefined>([]);

    const stableEntityRef = useRef<T[] | undefined>([]);

    useEffect(() => {
        if (isEqual(stableEntityRef.current, entity)) {
            return;
        }

        stableEntityRef.current = entity;
        setStableEntity(entity);
    }, [entity]);

    return {
        /**
         * Update when entity changes occur, otherwise do not update.
         */
        stableEntity,
    };
}
