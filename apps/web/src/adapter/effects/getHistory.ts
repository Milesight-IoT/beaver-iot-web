import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import type { InjectStore } from '@/adapter/types';

export const useFetch = () => {
    const request = async (entity: EntityOptionType, time: number) => {
        const now = Date.now();
        const { value } = entity || {};

        const [error, resp] = await awaitWrap(
            entityAPI.getHistory({
                entity_id: value,
                start_timestamp: now - time,
                end_timestamp: now,
                page_number: 1,
                page_size: 999,
            }),
        );
        if (error || !isRequestSuccess(resp)) return;

        return getResponseData(resp);
    };

    const run = (searchParams: InjectStore['searchParams']) => {
        const { entity, time } = searchParams || {};
        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);

        return Promise.all(entityList.map(entity => request(entity, time)));
    };

    return {
        run,
    };
};
