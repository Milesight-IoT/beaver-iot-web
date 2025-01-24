import { useRef } from 'react';
import { pick } from 'lodash-es';
import { shallow } from 'zustand/shallow';

type Many<T> = T | readonly T[];

/**
 * Subscribe to the state of the data in the Store, return a shallow comparison, no rerendering is triggered if there is no update (this function is equivalent to a simplified encapsulation of useShallow)
 * @param paths key in store
 */
export default function useStoreShallow<S extends object, P extends keyof S>(
    paths: Many<P>,
): (state: S) => Pick<S, P> {
    const prev = useRef<Pick<S, P>>({} as Pick<S, P>);

    return (state: S) => {
        if (state) {
            const next = pick(state, paths);
            // eslint-disable-next-line no-return-assign
            return shallow(prev.current, next) ? prev.current : (prev.current = next);
        }
        return prev.current;
    };
}
