import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import {
    awaitWrap,
    entityAPI,
    type EntityAPISchema,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import { useActivityEntity } from '@/pages/dashboard/plugin/hooks';
import type { ViewConfigProps } from '../../typings';

interface AggregateHistoryList {
    entity: EntityOptionType;
    data: EntityAPISchema['getAggregateHistory']['response'];
}
interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
export const useSourceData = (props: IProps) => {
    const { config, widgetId, dashboardId } = props;
    const { entity, metrics, time } = config || {};

    const { data: countData, runAsync: getData } = useRequest(
        async () => {
            if (!entity?.value) return;

            const run = async (selectEntity: EntityOptionType) => {
                const { value: entityId } = selectEntity || {};
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
            return Promise.resolve(run(entity));
        },
        { refreshDeps: [entity, time, metrics] },
    );

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: getData,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener, getData]);

    return {
        countData,
    };
};
