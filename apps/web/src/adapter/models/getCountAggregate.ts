import { useConnect } from '../core';
import { useFetch } from '../effects/getAggregateHistory';
import { useReducer } from '../reducers/getCountAggregate';
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