import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { entityAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import type { FilterParameters } from './types';

export type EntityFilterParams = FilterParameters & { keyword?: string; notScanKey?: boolean };
export interface EntityStoreType {
    status: 'ready' | 'loading' | 'finish';

    entityList: EntityData[];

    entityLoading: boolean;

    getEntityList: (params?: EntityFilterParams) => Promise<EntityData[]>;

    initEntityList: (params?: EntityFilterParams) => Promise<void>;

    getEntityDetailByKey: (entityKey: string) => Promise<EntityData | void>;
}

export default create(
    immer<EntityStoreType>((set, get) => ({
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
                notScanKey,
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
                    not_scan_key: notScanKey,
                    page_number: 1,
                    page_size: 999999,
                }),
            );

            if (error || !isRequestSuccess(resp)) return [];
            const data = getResponseData(resp);

            return data?.content || [];
        },

        getEntityDetailByKey: async (entityKey: string) => {
            const { status, initEntityList } = get();

            if (status === 'ready') {
                await initEntityList();
            }

            const { entityList } = get();
            return (entityList || []).find(entity => entity.entity_key === entityKey);
        },
    })),
);
