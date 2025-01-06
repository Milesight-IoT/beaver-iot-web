import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type EntityAPISchema,
} from '@/services/http';

type EntityFilterParams = Omit<
    ObjectToCamelCase<EntityAPISchema['getList']['request']>,
    'pageSize' | 'pageNumber'
>;
interface EntityStore {
    status: 'ready' | 'loading' | 'finish';

    entityList: EntityAPISchema['getList']['response']['content'];

    entityLoading: boolean;

    getEntityList: (params?: EntityFilterParams) => Promise<EntityStore['entityList']>;

    initEntityList: (params?: EntityFilterParams) => void;
}

export default create(
    immer<EntityStore>((set, get) => ({
        entityList: [],

        status: 'ready',

        entityLoading: false,

        initEntityList: async params => {
            set({ entityLoading: true, status: 'loading' });

            const entityList = await get().getEntityList(params);

            set({ entityList, entityLoading: false, status: 'finish' });
        },

        getEntityList: async params => {
            const {
                keyword,
                entityType: type,
                entityAccessMod: accessMode,
                excludeChildren,
                entityValueType: valueType,
            } = params || {};

            const entityType = type && (Array.isArray(type) ? type : [type]);
            const entityValueType =
                valueType && (Array.isArray(valueType) ? valueType : [valueType]);
            const entityAccessMode =
                accessMode && (Array.isArray(accessMode) ? accessMode : [accessMode]);
            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword,
                    entity_type: entityType,
                    entity_value_type: entityValueType,
                    entity_access_mod: entityAccessMode,
                    exclude_children: excludeChildren,
                    page_number: 1,
                    page_size: 99999,
                }),
            );

            if (error || !isRequestSuccess(resp)) return [];
            const data = getResponseData(resp);

            return data?.content || [];
        },
    })),
);
