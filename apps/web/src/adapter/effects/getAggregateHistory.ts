import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import type { InjectStore } from '@/adapter/types';

export const useFetch = () => {
    const request = async (entity: EntityOptionType, metrics: DataAggregateType, time: number) => {
        const now = Date.now();
        const { value: entityId } = entity || {};

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
    };

    const run = (searchParams: InjectStore['searchParams']) => {
        const { entity, time, metrics } = searchParams || {};
        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);

        return Promise.all(entityList.map(entity => request(entity, metrics, time)));
    };

    return {
        run,
    };
};
