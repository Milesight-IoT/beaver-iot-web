import { useConnect } from '../core';
import { useFetch } from '../effects/getEntityStatus';
import { useReducer } from '../reducers/getEntityStatus';
import type { PluginProps } from '../types';

export const useModel = <T extends Record<string, any>>({
    viewProps,
    adapter,
}: {
    viewProps: PluginProps<T>;
    adapter: Adapter;
}) => {
    const { run: effect } = useFetch();
    const { run: reducer } = useReducer();

    return useConnect({ viewProps, adapter, effect, reducer });
};
