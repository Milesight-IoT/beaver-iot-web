import React, { useRef, useMemo, useEffect } from 'react';
import cls from 'classnames';
import { isUndefined } from 'lodash-es';
import { useMemoizedFn, useInViewport } from 'ahooks';
// import { CircularProgress } from '@mui/material';
import { useI18n, useVirtualList, type UseVirtualListOptions } from '@milesight/shared/src/hooks';
import Empty from '../empty';
import './style.less';

type Data = Record<string, any>;

interface Props<TData extends Data> {
    data?: TData[];

    /**
     * Whether is loading more data
     */
    loadingMore?: boolean;

    /**
     * Whether is no more data
     */
    isNoMore?: boolean;

    /**
     * The extra buffer items outside of the view area
     */
    overscan?: UseVirtualListOptions<TData>['overscan'];

    /**
     * Scroll threshold, default is 100
     */
    scrollThreshold?: number;

    /**
     * List Container height, default is 100%
     */
    height?: number | `${number}px` | `${number}%` | `${number}vh`;

    /**
     * Item height, accept a pixel value or a function that returns the height
     */
    itemHeight: UseVirtualListOptions<TData>['itemHeight'];

    /**
     * List Container className
     */
    className?: string;

    /**
     * Loading indicator
     */
    loadingIndicator?: React.ReactNode;

    /**
     * No more data indicator
     */
    noMoreIndicator?: React.ReactNode;

    /**
     * Item renderer
     */
    itemRenderer: (item: TData, index: number) => React.ReactNode;

    /**
     * Empty renderer
     */
    emptyRenderer?: React.ReactNode | (() => React.ReactNode);

    /**
     * Load more data callback, will be called when scroll to bottom
     */
    onLoadMore?: () => void | Promise<void>;
}

/**
 * Infinite Scroll Virtual List
 */
const InfiniteScrollList = <TData extends Data>({
    data,
    loadingMore,
    isNoMore,
    overscan = 10,
    scrollThreshold = 150,
    height = '100%',
    itemHeight,
    className,
    loadingIndicator,
    noMoreIndicator,
    itemRenderer,
    emptyRenderer,
    onLoadMore,
}: Props<TData>) => {
    const { getIntlText } = useI18n();
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);

    // ---------- Virtual List ----------
    const memoData = useMemo(() => data ?? [], [data]);
    const [list, scrollTo] = useVirtualList<TData>(memoData, {
        containerTarget: containerRef,
        wrapperTarget: wrapperRef,
        itemHeight,
        overscan,
    });

    // ---------- Load More ----------
    const handleLoadMore = useMemoizedFn(() => onLoadMore?.());
    const [inViewport] = useInViewport(indicatorRef, {
        rootMargin: `0px 0px ${scrollThreshold}px 0px`,
        root: containerRef.current,
    });

    useEffect(() => {
        if (!inViewport || loadingMore || isNoMore) return;
        handleLoadMore();
    }, [loadingMore, isNoMore, inViewport, handleLoadMore]);

    // ---------- Render Empty ----------
    const emptyPlaceholder = useMemo(() => {
        let result: React.ReactNode;
        if (isUndefined(emptyRenderer)) {
            result = <Empty text={getIntlText('common.label.empty')} />;
        } else {
            result = typeof emptyRenderer === 'function' ? emptyRenderer() : emptyRenderer;
        }

        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getIntlText]);

    return (
        <div
            className={cls('ms-mobile-infinite-scroll-root', className)}
            ref={containerRef}
            style={{ height }}
        >
            {!list.length && emptyPlaceholder}
            <div className="ms-mobile-infinite-scroll-wrapper" ref={wrapperRef}>
                {list.map(item => itemRenderer(item.data, item.index))}
            </div>
            {!!memoData.length && (
                <div className="ms-mobile-infinite-scroll-indicator" ref={indicatorRef}>
                    {loadingMore && (
                        <div className="loading">
                            {/* {loadingIndicator ?? <CircularProgress size={16} />} */}
                            {loadingIndicator ?? getIntlText('common.label.loading')}
                        </div>
                    )}
                    {!loadingMore && isNoMore && (
                        <div className="no-more">
                            {noMoreIndicator ?? getIntlText('common.label.no_more_data')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollList;
