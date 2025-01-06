import { useCallback, useMemo, useState } from 'react';
import { useInfiniteScroll, useVirtualList } from 'ahooks';
import { useTime } from '@milesight/shared/src/hooks';
import { generateUUID } from '@milesight/shared/src/utils/tools';
import { awaitWrap } from '@/services/http';
import type {
    InfiniteScrollType,
    LogItemProps,
    LogListPageType,
    LogRenderListType,
    PaginationModel,
} from '../types';

interface IProps {
    containerRef: React.RefObject<HTMLDivElement>;
    listRef: React.RefObject<HTMLDivElement>;
    getLogList: (pageInfo: PaginationModel) => Promise<LogListPageType>;
}
export const useRenderList = ({ getLogList, containerRef, listRef }: IProps) => {
    const [paginationModel, setPaginationModel] = useState<PaginationModel>({
        page: 0,
        pageSize: 20,
    });
    const { getTimeFormat } = useTime();

    /** get log List */
    const getRenderLogList = useCallback(
        (logList: LogListPageType['content']): LogItemProps[] => {
            return (logList || []).map(item => {
                const { start_time: startTime, status, id, version } = item || {};
                return {
                    id,
                    status,
                    title: startTime ? getTimeFormat(startTime, 'fullDateTimeSecondFormat') : '',
                    version,
                };
            });
        },
        [getTimeFormat],
    );

    /** Infinite Scroll */
    const { data, loading } = useInfiniteScroll<InfiniteScrollType>(
        async data => {
            const [error, result] = await awaitWrap(
                getLogList({ ...paginationModel, page: paginationModel.page + 1 }),
            );

            /** When an error is reported, the next page is not loaded */
            if (error) {
                return {
                    ...(data || {}),
                    hasMore: false,
                } as InfiniteScrollType;
            }

            /** load success */
            const { page_number: pageNumber, page_size: pageSize, content, total } = result! || {};
            const hasMore = (pageNumber - 1) * pageSize + (content?.length || 0) < total;
            setPaginationModel({ ...paginationModel, page: pageNumber, pageSize });

            return {
                list: getRenderLogList(content),
                source: result,
                hasMore,
            };
        },
        {
            target: containerRef,
            isNoMore: result => !result?.hasMore,
        },
    );

    /** generate log render list */
    const renderLogList = useMemo(() => {
        const { list = [], hasMore } = data || {};
        if (!hasMore) return list;

        const footer = {
            id: generateUUID(),
            $$isFooterNode: true,
        } as unknown as LogRenderListType;
        return list.concat(footer);
    }, [data]);

    /** virtual list */
    const [virtualList] = useVirtualList(renderLogList, {
        containerTarget: containerRef,
        wrapperTarget: listRef,
        itemHeight: 38,
        overscan: 15,
    });

    return {
        scrollItem: data,
        virtualList,
        getLogListLoading: loading,
    };
};
