import { useEffect, useMemo } from 'react';
import { useRequest } from 'ahooks';
import ws, { getExChangeTopic } from '@/services/ws';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { ViewConfigProps, AggregateHistoryList } from '../../typings';

interface IProps {
    entityList: ViewConfigProps['entityList'];
    metrics: ViewConfigProps['metrics'];
    time: ViewConfigProps['time'];
}
export const useSource = (props: IProps) => {
    const { entityList, metrics, time } = props;

    const { data: aggregateHistoryList, runAsync: getAggregateHistoryList } = useRequest(
        async () => {
            if (!entityList || entityList.length === 0) return;

            const run = async (entity: EntityOptionType) => {
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

                const data = getResponseData(resp);
                return {
                    entity,
                    data,
                } as AggregateHistoryList;
            };
            const fetchList = entityList.map((entity: EntityOptionType) => run(entity));
            return Promise.all(fetchList.filter(Boolean) as unknown as AggregateHistoryList[]);
        },
        { manual: true },
    );

    useEffect(() => {
        getAggregateHistoryList();
    }, [entityList, time, metrics]);

    const topics = useMemo(() => {
        return (entityList || [])
            .map((entity: EntityOptionType) => {
                const entityKey = entity?.rawData?.entityKey?.toString();
                return entityKey && getExChangeTopic(entityKey);
            })
            .filter(Boolean) as string[];
    }, [entityList]);
    // Subscribe to WS theme
    useEffect(() => {
        if (!topics?.length) return;

        return ws.subscribe(topics, getAggregateHistoryList);
    }, [topics]);

    return {
        aggregateHistoryList,
    };
};
