import { create } from 'zustand';
import { debounce } from 'lodash-es';
import {
    tagAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type TagAPISchema,
} from '@/services/http';

interface UseTagSelectStore {
    /**
     * Is init data ready
     */
    isDataReady?: boolean;

    /**
     * Global tags
     */
    tags?: TagAPISchema['getTagList']['response']['content'] | null;

    /**
     * Get tags
     */
    getTags: (params?: TagAPISchema['getTagList']['request']) => Promise<UseTagSelectStore['tags']>;

    /**
     * Refresh tags
     */
    refreshTags: (forced?: boolean) => void;
}

const useTagSelectStore = create<UseTagSelectStore>((set, get) => ({
    getTags: async params => {
        const isSearch = !!params?.keyword;
        const [err, resp] = await awaitWrap(
            tagAPI.getTagList({
                ...params,
                page_size: 999,
                page_number: 1,
            }),
        );

        if (err || !isRequestSuccess(resp)) return null;
        const data = getResponseData(resp)?.content;

        if (!isSearch) {
            set({ isDataReady: true, tags: data });
        }
        return data;
    },

    refreshTags: debounce<UseTagSelectStore['refreshTags']>(async (forced = false) => {
        const { tags, getTags } = get();

        if (!forced && tags?.length) return tags;
        await getTags();
    }, 300),
}));

export default useTagSelectStore;
