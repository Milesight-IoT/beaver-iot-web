import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';

export type GetEntityChildrenType = {
    id: ApiKey;
};

export type CallServiceType = {
    entity_id: ApiKey;
    exchange: Record<string, any>;
};

export const useEntityApi = () => {
    // 获取子实体
    const getEntityChildren = async (params: GetEntityChildrenType) => {
        const [error, res]: any = await awaitWrap(entityAPI.getChildrenEntity(params));
        if (isRequestSuccess(res)) {
            return {
                error,
                res: getResponseData(res),
            };
        }
        return { error };
    };

    // 下发服务
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

    // 更新属性
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
