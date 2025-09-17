import { useCallback, useEffect, useRef } from 'react';
import { useDynamicList } from 'ahooks';

/**
 * Hooks that can obtain the latest values based on operations related to use dynamic list
 */
const useSyncDynamic = <T extends Record<string, any>>(initialList?: T[]) => {
    const listRef = useRef<any>([]);
    const {
        list,
        insert: originInsert,
        replace: originReplace,
        resetList: originResetList,
        ...rest
    } = useDynamicList<T>(initialList);

    useEffect(() => {
        listRef.current = list;
    }, [list]);

    const resetList = useCallback((newList: T[]): T[] => {
        listRef.current = newList;
        originResetList(newList);
        return listRef.current;
    }, []);

    const insert = useCallback((index: number, item: T) => {
        const newList = [...list];
        newList.splice(index, 0, item);
        listRef.current = newList;
        originInsert(index, item);
        return listRef.current;
    }, []);

    const replace = useCallback((index: number, item: T) => {
        const newList = [...list];
        newList.splice(index, 1, item);
        listRef.current = newList;
        originReplace(index, item);
        return listRef.current;
    }, []);

    return {
        ...rest,
        list,
        insert,
        replace,
        resetList,
    };
};

export default useSyncDynamic;
