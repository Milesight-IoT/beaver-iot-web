import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useInitialize } from './useInitialize';
import { useFilter } from './useFilter';
import { useSearch } from './useSearch';
import useEntityStore from '../store';
import type { FilterParameters } from '../types';

export const useSourceData = (props: FilterParameters) => {
    const { entityType, entityAccessMod, excludeChildren, entityValueType } = props;
    const { entityList, entityLoading } = useEntityStore(
        useShallow(state => ({
            entityList: state.entityList,
            entityLoading: state.entityLoading,
        })),
    );

    const hasFilterParams = useMemo(
        () => !!(entityType || entityAccessMod || excludeChildren || entityValueType),
        [entityType, entityAccessMod, excludeChildren, entityValueType],
    );
    useInitialize({ hasFilterParams });
    const { filterLoading, filterEntityList } = useFilter({
        entityType,
        entityAccessMod,
        excludeChildren,
        entityValueType,
        hasFilterParams,
    });
    const { keyword, searchEntityList, searchLoading, onSearch } = useSearch({
        entityType,
        entityAccessMod,
        excludeChildren,
        entityValueType,
    });

    const fetchEntityList = useMemo(() => {
        if (!keyword) return hasFilterParams ? filterEntityList : entityList;
        return searchEntityList;
    }, [entityList, hasFilterParams, keyword, searchEntityList, filterEntityList]);

    const fetchLoading = useMemo(() => {
        if (!keyword) return hasFilterParams ? filterLoading : entityLoading;
        return searchLoading;
    }, [entityLoading, hasFilterParams, keyword, searchLoading, filterLoading]);

    const sourceList = useMemo(
        () => (hasFilterParams ? filterEntityList : entityList),
        [entityList, filterEntityList, hasFilterParams],
    );

    return {
        entityList: useMemo(() => fetchEntityList || [], [fetchEntityList]),
        loading: fetchLoading,
        onSearch,
        sourceList,
    };
};
