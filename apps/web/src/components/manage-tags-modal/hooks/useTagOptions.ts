import { useMemo } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isEmpty, omit } from 'lodash-es';

import { tagAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

export function useTagOptions() {
    const {
        loading: tagsLoading,
        data: tagData,
        run: getTagList,
    } = useRequest(async () => {
        const [error, resp] = await awaitWrap(
            tagAPI.getTagList({
                page_number: 1,
                page_size: 300,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const data = getResponseData(resp);
        return data?.content || [];
    });

    const tagOptions: TagProps[] = useMemo(() => {
        if (!Array.isArray(tagData) || isEmpty(tagData)) {
            return [];
        }

        return tagData.map(t => omit(t, ['tagged_entities_count', 'created_at']));
    }, [tagData]);

    const getTagById = useMemoizedFn((id: ApiKey) => {
        if (!id || !Array.isArray(tagData) || isEmpty(tagData)) return undefined;

        return tagData.find(t => t.id === id);
    });

    return {
        tagsLoading,
        tagOptions,
        /**
         * Get tag detail by id
         */
        getTagById,
        /**
         * Get tag list
         */
        getTagList,
    };
}
