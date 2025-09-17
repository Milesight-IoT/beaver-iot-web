import { useEffect, useMemo } from 'react';
import { useRequest } from 'ahooks';
// import ws, { getExChangeTopic } from '@/services/ws';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { useActivityEntity } from '../../../../hooks';
import { ViewConfigProps, AggregateHistoryList } from '../../typings';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    entityList: ViewConfigProps['entityList'];
    metrics: ViewConfigProps['metrics'];
    time: ViewConfigProps['time'];
}
export const useSource = (props: IProps) => {
    const { entityList, metrics, time, widgetId, dashboardId } = props;

    const { data: aggregateHistoryList, run: getAggregateHistoryList } = useRequest(
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
        {
            manual: true,
            debounceWait: 300,
        },
    );

    useEffect(() => {
        getAggregateHistoryList();
    }, [entityList, time, metrics]);

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();
    const entityIds = useMemo(() => {
        return (entityList || []).map(entity => entity?.value);
    }, [entityList]);

    useEffect(() => {
        if (!widgetId || !dashboardId || !entityIds.length) return;

        const removeEventListener = addEntityListener(entityIds, {
            widgetId,
            dashboardId,
            callback: getAggregateHistoryList,
        });

        return () => {
            removeEventListener();
        };
    }, [entityIds, widgetId, dashboardId, addEntityListener, getAggregateHistoryList]);

    return {
        aggregateHistoryList,
    };
};
