import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMemoizedFn, useRequest } from 'ahooks';
import useEntityStore from '../store';
import type { EntitySelectProps } from '../types';

export const useSourceData = (
    props: Pick<
        EntitySelectProps,
        'entityType' | 'entityAccessMod' | 'excludeChildren' | 'entityValueType'
    >,
) => {
    const { entityType, entityAccessMod, excludeChildren, entityValueType } = props;
    const [keyword, setKeyword] = useState('');
    const { entityList, getEntityList, entityLoading, initEntityList, status } = useEntityStore(
        useShallow(state => ({
            entityList: state.entityList,
            entityLoading: state.entityLoading,
            getEntityList: state.getEntityList,
            initEntityList: state.initEntityList,
            status: state.status,
        })),
    );

    const init = useMemoizedFn(() => {
        initEntityList();
    });
    useEffect(() => {
        if (status !== 'ready') return;

        init();
    }, [init, initEntityList, status]);

    const { data: searchEntityList, loading: searchLoading } = useRequest(
        async () => {
            if (!keyword) return [];

            const params = {
                keyword,
                entityType,
                entityAccessMod,
                excludeChildren,
                entityValueType,
            };
            return getEntityList(params);
        },
        { refreshDeps: [keyword], debounceWait: 300 },
    );
    /** search entity list by keyword */
    const onSearch = useCallback((keyword: string) => {
        setKeyword(keyword);
    }, []);

    const hasFilterParams = useMemo(
        () => !!(entityType || entityAccessMod || excludeChildren || entityValueType),
        [entityType, entityAccessMod, excludeChildren, entityValueType],
    );
    const { data: sourceEntityList, loading: sourceSearchLoading } = useRequest(
        async () => {
            if (!hasFilterParams) return;

            const params = {
                entityType,
                entityAccessMod,
                excludeChildren,
                entityValueType,
            };
            return getEntityList(params);
        },
        {
            refreshDeps: [entityType, entityAccessMod, excludeChildren, entityValueType],
        },
    );

    const fetchEntityList = useMemo(() => {
        if (!keyword) return hasFilterParams ? sourceEntityList : entityList;
        return searchEntityList;
    }, [entityList, hasFilterParams, keyword, searchEntityList, sourceEntityList]);
    const fetchLoading = useMemo(() => {
        if (!keyword) return hasFilterParams ? sourceSearchLoading : entityLoading;
        return searchLoading;
    }, [entityLoading, hasFilterParams, keyword, searchLoading, sourceSearchLoading]);

    return {
        entityList: useMemo(() => fetchEntityList || [], [fetchEntityList]),
        loading: fetchLoading,
        onSearch,
    };
};
