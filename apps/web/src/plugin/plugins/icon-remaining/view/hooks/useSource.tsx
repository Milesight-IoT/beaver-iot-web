import { useEffect, useMemo } from 'react';
import { useRequest } from 'ahooks';
import ws, { getExChangeTopic } from '@/services/ws';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import type { ViewConfigProps } from '../../typings';

interface IProps {
    entity: ViewConfigProps['entity'];
    metrics: ViewConfigProps['metrics'];
    time: ViewConfigProps['time'];
}
export const useSource = (props: IProps) => {
    const { entity, metrics, time } = props;

    const { data: aggregateHistoryData, runAsync: getAggregateHistoryData } = useRequest(
        async () => {
            const { value: entityId } = entity || {};
            if (!entityId) return;

            const now = Date.now();
            const [error, resp] = await awaitWrap(
                entityAPI.getAggregateHistory({
                    entity_id: entityId,
                    aggregate_type: metrics,
                    start_timestamp: now - time,
                    end_timestamp: now,
                }),
            );
            if (error || !isRequestSuccess(resp)) return;

            return getResponseData(resp);
        },
        { manual: true },
    );

    useEffect(() => {
        getAggregateHistoryData();
    }, [entity, time, metrics]);

    const topic = useMemo(() => {
        const entityKey = entity?.rawData?.entityKey?.toString();
        return entityKey && getExChangeTopic(entityKey);
    }, [entity]);
    // Subscribe to WS theme
    useEffect(() => {
        if (!topic) return;

        return ws.subscribe(topic, getAggregateHistoryData);
    }, [topic]);

    return {
        aggregateHistoryData,
    };
};
