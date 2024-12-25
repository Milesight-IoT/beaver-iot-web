import { useMemo } from 'react';
import { useProvider } from './useProvider';
import { useMsRequest } from './useMsRequest';
import { useMsWebsocket } from './useMsWebsocket';
import type { PluginProps } from '../types';

export const useConnect = <
    T extends Record<string, any>,
    E extends (...params: any[]) => any,
    R extends (...params: any[]) => any,
>({
    viewProps,
    adapter,
    effect,
    reducer,
}: {
    viewProps: PluginProps<T>;
    adapter: Adapter;
    effect: E;
    reducer: R;
}) => {
    const store = useProvider<T>({ viewProps, adapter });
    const { config, configJson } = viewProps || {};

    const result = useMsRequest({
        viewProps,
        store,
        effect,
        reducer,
    });

    useMsWebsocket<T>({
        store,
        viewProps,
        runAsync: result?.runAsync,
    });

    return useMemo(() => {
        return {
            ...result,
            config,
            configJson,
        };
    }, [config, configJson, result]);
};
