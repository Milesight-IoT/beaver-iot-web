import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    entityAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type EntityAPISchema,
} from '@/services/http';

export type EntityFilterParams = {
    /** Search Keyword */
    keyword?: string;
    /** Entity Type */
    type?: EntityType | EntityType[];
    /** Entity Value Type */
    valueType?: EntityValueDataType | EntityValueDataType[];
    /** Entity Access Mode */
    accessMode?: EntityAccessMode | EntityAccessMode[];
    /** Exclude Children */
    excludeChildren?: boolean;
};

interface ConfigPanelStore {
    entityList?: EntityAPISchema['getList']['response']['content'];

    // searchList?: EntityAPISchema['getList']['response']['content'];

    setEntityList: (list: ConfigPanelStore['entityList']) => void;

    getEntityList: (
        params?: EntityFilterParams,
        cached?: boolean,
    ) => Promise<ConfigPanelStore['entityList']> | undefined;

    // setSearchList: (list: ConfigPanelStore['searchList']) => void;
}

const useConfigPanelStore = create(
    immer<ConfigPanelStore>(set => ({
        setEntityList: entityList => set({ entityList }),

        getEntityList: async (params, cached) => {
            const entityType =
                params?.type && (Array.isArray(params.type) ? params.type : [params.type]);
            const valueType =
                params?.valueType &&
                (Array.isArray(params.valueType) ? params.valueType : [params.valueType]);
            const accessMode =
                params?.accessMode &&
                (Array.isArray(params.accessMode) ? params.accessMode : [params.accessMode]);
            const [error, resp] = await awaitWrap(
                entityAPI.getList({
                    keyword: params?.keyword,
                    entity_type: entityType,
                    entity_value_type: valueType,
                    entity_access_mod: accessMode,
                    exclude_children: params?.excludeChildren,
                    page_number: 1,
                    page_size: 99999,
                }),
            );

            if (error || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp)!;

            if (cached) set({ entityList: data?.content });
            return data?.content || [];
        },
    })),
);

export default useConfigPanelStore;
