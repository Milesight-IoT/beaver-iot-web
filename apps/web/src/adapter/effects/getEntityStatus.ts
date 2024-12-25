import { InjectStore } from '@/adapter/types';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';

export const useFetch = () => {
    const request = async (entity: EntityOptionType) => {
        const { value: entityId } = entity || {};

        const [error, resp] = await awaitWrap(
            entityAPI.getEntityStatus({
                id: entityId,
            }),
        );
        if (error || !isRequestSuccess(resp)) return;

        return getResponseData(resp);
    };

    const run = (searchParams: InjectStore['searchParams']) => {
        const { entity } = searchParams || {};
        const entityList = Array.isArray(entity) ? entity : [entity].filter(Boolean);

        return Promise.all(entityList.map(entity => request(entity)));
    };

    return {
        run,
    };
};
