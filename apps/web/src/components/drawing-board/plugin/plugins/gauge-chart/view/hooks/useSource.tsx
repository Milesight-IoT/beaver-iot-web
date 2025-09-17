import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { useActivityEntity } from '../../../../hooks';
import type { ViewConfigProps } from '../../typings';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    entity: ViewConfigProps['entity'];
    metrics: ViewConfigProps['metrics'];
    time: ViewConfigProps['time'];
}
export const useSource = (props: IProps) => {
    const { entity, metrics, time, widgetId, dashboardId } = props;

    const { data: aggregateHistoryData, run: getAggregateHistoryData } = useRequest(
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
        {
            manual: true,
            debounceWait: 300,
        },
    );
    useEffect(() => {
        getAggregateHistoryData();
    }, [entity, time, metrics]);

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: getAggregateHistoryData,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener, getAggregateHistoryData]);

    return {
        aggregateHistoryData,
    };
};
