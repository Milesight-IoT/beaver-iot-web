import { useCallback } from 'react';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';

export type GetEntityChildrenType = {
    id: ApiKey;
};

export type CallServiceType = {
    entity_id: ApiKey;
    exchange: Record<string, any>;
};

/**
 * Entity API Hook
 * @deprecated Type missing, functional redundancy, DO NOT USE IT ANYMORE !
 */
export const useEntityApi = () => {
    // Get the sub -entity
    const getEntityChildren = useCallback(async (params: GetEntityChildrenType) => {
        const [error, res]: any = await awaitWrap(entityAPI.getChildrenEntity(params));
        if (isRequestSuccess(res)) {
            return {
                error,
                res: getResponseData(res),
            };
        }
        return { error };
    }, []);

    // Issue service
    const callService = async (params: CallServiceType) => {
        const [error, res]: any = await awaitWrap(entityAPI.callService(params));
        if (isRequestSuccess(res)) {
            return {
                error,
                res: getResponseData(res),
            };
        }
        return { error };
    };

    // Update attribute
    const updateProperty = async (params: CallServiceType) => {
        const [error, res]: any = await awaitWrap(entityAPI.updateProperty(params));
        if (isRequestSuccess(res)) {
            return {
                error,
                res: getResponseData(res),
            };
        }
        return { error };
    };

    return {
        getEntityChildren,
        callService,
        updateProperty,
    };
};
