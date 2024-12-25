import { useMemo } from 'react';
import type { Adapter, InjectStore, PluginProps, SearchKeys } from '../types';

const DEFAULT_SEARCH_KEYS = ['entity', 'time', 'metrics'];
export const useProvider = <T extends Record<string, any>>({
    viewProps,
    adapter,
    searchKeys = DEFAULT_SEARCH_KEYS,
}: {
    viewProps: PluginProps<T>;
    adapter: Adapter;
    searchKeys?: SearchKeys;
}): InjectStore => {
    const { config, configJson } = viewProps;
    const { websocket } = adapter || {};

    /** 是否启用WebSocket */
    const enableWs = useMemo(() => {
        // 默认启用
        if (websocket === void 0) return true;

        return websocket?.toString() === 'true';
    }, [websocket]);

    /** 获取查询参数 */
    const { searchParams, configParams } = useMemo(() => {
        const searchParams: Record<string, any> = {};
        const configParams: Record<string, any> = {};

        // 没有值时，直接返回
        if (!searchKeys?.length) return { searchParams, configParams };

        // 获取查询参数
        const { configProps } = configJson || {};
        (configProps || []).forEach(configProp => {
            const { components } = configProp || {};

            (components || []).forEach(component => {
                const { key } = component || {};

                for (const k of searchKeys) {
                    if (typeof k === 'string') {
                        if (k === key) {
                            searchParams[key] = config[key];
                            configParams[key] = config[key];
                            break;
                        }
                    } else {
                        const { key: kKey, value: kValue } = k || {};

                        if (kKey === key) {
                            searchParams[kValue] = config[key];
                            configParams[key] = config[key];
                            break;
                        }
                    }
                }
            });
        });

        return { searchParams, configParams };
    }, [config, configJson, searchKeys]);

    /** 收集更新依赖 */
    const refreshDeps = useMemo(() => {
        return Object.keys(configParams).map(key => {
            if (Reflect.has(config, key)) return config[key];
            return void 0;
        });
    }, [config, configParams]);

    return {
        enableWs,
        refreshDeps,
        searchParams,
    };
};
