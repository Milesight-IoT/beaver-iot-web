import { useCallback } from 'react';
import { GridValidRowModel } from '@mui/x-data-grid';
import { USER_CACHE_PREFIX } from '@milesight/shared/src/utils/storage';
import { useUserStore } from '@/stores';
import { TableProProps } from '../types';
import { COLUMNS_CACHE_KEY } from '../constants';

/**
 * Obtain the column cache key
 * @param tableName global unique
 * @returns eg: mos.columns.display.entity_table.user.1895047636030201857
 */
const useColumnsCacheKey = (tableName: TableProProps<GridValidRowModel>['tableName']) => {
    const { userInfo } = useUserStore();
    const getCacheKey = useCallback(
        (type: 'display' | 'width') => {
            if (!userInfo?.user_id || !tableName) {
                return '';
            }
            return `${COLUMNS_CACHE_KEY}.${type}${tableName && `.${tableName}`}${
                userInfo?.user_id && `.${USER_CACHE_PREFIX}.${userInfo?.user_id}`
            }`;
        },
        [userInfo, tableName],
    );

    return { getCacheKey };
};

export default useColumnsCacheKey;
