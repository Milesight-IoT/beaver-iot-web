import { useRef } from 'react';
import { pick } from 'lodash-es';
import { shallow } from 'zustand/shallow';

type Many<T> = T | readonly T[];

/**
 * 订阅 Store 中数据状态，返回时会进行浅比较，若无更新则不会触发重渲染（该函数相当于是 useShallow 的简化封装）
 * @param paths store 中的 key
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
