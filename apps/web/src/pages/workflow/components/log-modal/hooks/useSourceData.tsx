import { useCallback } from 'react';
import { delay, generateUUID, withPromiseResolvers } from '@milesight/shared/src/utils/tools';
import type { PaginationModel, LogListPageType } from '../types';

export const useSourceData = () => {
    // TODO
    const generateList = useCallback((limit: number): LogListPageType['content'] => {
        return Array.from({ length: limit }).map(() => ({
            id: generateUUID(),
            status: Math.random() > 0.5 ? 'SUCCESS' : 'ERROR',
            start_time: Date.now(),
        }));
    }, []);
    // TODO
    const getLogList = useCallback(
        async (pageInfo: PaginationModel) => {
            const { page, pageSize } = pageInfo || {};
            const { promise, resolve } = withPromiseResolvers<LogListPageType>();

            await delay(1000);

            resolve({
                page_size: pageSize,
                page_number: page,
                content: generateList(pageSize),
                total: 100,
            });
            return promise;
        },
        [generateList],
    );

    return {
        getLogList,
    };
};
