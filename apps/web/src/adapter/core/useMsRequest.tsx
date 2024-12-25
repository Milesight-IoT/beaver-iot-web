import { useRequest } from 'ahooks';
import type { InjectStore, PluginProps } from '../types';

export const useMsRequest = <
    T extends Record<string, any>,
    E extends (...params: any[]) => any,
    R extends (...params: any[]) => any,
>({
    viewProps,
    store,
    effect,
    reducer,
}: {
    viewProps: PluginProps<T>;
    store: InjectStore;
    effect: E;
    reducer: R;
}) => {
    const { refreshDeps, searchParams } = store || {};

    const request = async (): Promise<ReturnType<R> | void> => {
        if (!effect) return;
        const data = await effect(searchParams);

        if (!reducer) return;
        return reducer(data, viewProps);
    };
    return useRequest(request, { refreshDeps });
};
