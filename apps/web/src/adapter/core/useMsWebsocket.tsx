import { useEffect, useMemo } from 'react';
import type { Result } from 'ahooks/lib/useRequest/src/types';
import ws, { getExChangeTopic } from '@/services/ws';
import type { InjectStore, PluginProps } from '../types';

export const useMsWebsocket = <T extends Record<string, any>>({
    store,
    viewProps,
    runAsync,
}: {
    store: InjectStore;
    viewProps: PluginProps<T>;
    runAsync: Result<any, []>['runAsync'];
}) => {
    const { enableWs } = store || {};
    const { config, configJson } = viewProps;
    const { entity } = config || {};
    const { isPreview } = configJson || {};

    /** 获取订阅主题列表 */
    const topics = useMemo(() => {
        const entityList = Array.isArray(entity) ? entity : [entity];

        return (entityList || [])
            .map(entity => {
                const entityKey = entity?.rawData?.entityKey?.toString();
                if (!entityKey) return;

                return getExChangeTopic(entityKey);
            })
            .filter(Boolean) as string[];
    }, [entity]);

    // 订阅 WS 主题
    useEffect(() => {
        if (!topics?.length || !enableWs || isPreview) return;

        return ws.subscribe(topics, runAsync);
    }, [topics, enableWs, isPreview]);
};
