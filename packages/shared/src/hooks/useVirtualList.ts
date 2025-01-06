import React, { useEffect, useState, useRef, useCallback } from 'react';
import { isNumber } from 'lodash-es';
import { useEventListener, useLatest, useMemoizedFn, useSize, useUpdateEffect } from 'ahooks';
import { getTargetElement, type BasicTarget } from 'ahooks/es/utils/domTarget';

type ItemHeight<T> = (index: number, data: T) => number;

export interface Options<T> {
    containerTarget: BasicTarget;
    wrapperTarget: BasicTarget;
    itemHeight: number | ItemHeight<T>;
    overscan?: number;
}

/**
 * Virtual List Hook
 *
 * Inspired By AHooks useVirtualList
 */
const useVirtualList = <T = any>(list: T[], options: Options<T>) => {
    const { containerTarget, wrapperTarget, itemHeight, overscan = 5 } = options;

    const itemHeightRef = useLatest(itemHeight);

    const size = useSize(containerTarget);

    const scrollTriggerByScrollToFunc = useRef(false);

    const [targetList, setTargetList] = useState<{ index: number; data: T }[]>([]);

    const [wrapperStyle, setWrapperStyle] = useState<React.CSSProperties>({});

    const getVisibleCount = (containerHeight: number, fromIndex: number) => {
        if (isNumber(itemHeightRef.current)) {
            return Math.ceil(containerHeight / itemHeightRef.current);
        }

        let sum = 0;
        let endIndex = fromIndex + 1;
        // The starting index may only have a partial area within the container viewport,
        // so it is calculated from the next index of the starting index
        for (let i = fromIndex + 1; i < list.length; i++) {
            const height = itemHeightRef.current(i, list[i]);
            sum += height;
            endIndex = i;
            if (sum >= containerHeight) {
                break;
            }
        }

        // The starting index and ending index may only have some areas within the container viewport,
        // so the calculation of the number of visible items should be uniformly increased by 1
        return endIndex - fromIndex + 1;
    };

    const getOffset = (scrollTop: number) => {
        if (isNumber(itemHeightRef.current)) {
            return Math.floor(scrollTop / itemHeightRef.current);
        }
        let sum = 0;
        let offset = 0;
        for (let i = 0; i < list.length; i++) {
            const height = itemHeightRef.current(i, list[i]);
            sum += height;
            if (sum >= scrollTop) {
                offset = i;
                break;
            }
        }

        return offset;
    };

    // Get hidden sub item height
    const getDistanceTop = (index: number) => {
        if (isNumber(itemHeightRef.current)) {
            const height = index * itemHeightRef.current;
            return height;
        }
        const height = list
            .slice(0, index)
            .reduce((sum, _, i) => sum + (itemHeightRef.current as ItemHeight<T>)(i, list[i]), 0);
        return height;
    };

    const getTotalHeight = useCallback(() => {
        if (isNumber(itemHeightRef.current)) {
            return list.length * itemHeightRef.current;
        }
        return list.reduce(
            (sum, _, index) => sum + (itemHeightRef.current as ItemHeight<T>)(index, list[index]),
            0,
        );
    }, [list]);

    const calculateRange = () => {
        const container = getTargetElement(containerTarget);

        if (container) {
            const { scrollTop, clientHeight } = container;

            const offset = getOffset(scrollTop);
            const visibleCount = getVisibleCount(clientHeight, offset);

            const start = Math.max(0, offset - overscan);
            const end = Math.min(list.length, offset + visibleCount + overscan);

            const offsetTop = getDistanceTop(start);
            const totalHeight = getTotalHeight();

            setWrapperStyle({
                height: `${totalHeight - offsetTop}px`,
                paddingTop: `${offsetTop}px`,
            });

            setTargetList(
                list.slice(start, end).map((ele, index) => ({
                    data: ele,
                    index: index + start,
                })),
            );
        }
    };

    useUpdateEffect(() => {
        const wrapper = getTargetElement(wrapperTarget) as HTMLElement;
        if (wrapper) {
            // @ts-ignore
            // eslint-disable-next-line no-return-assign
            Object.keys(wrapperStyle).forEach(key => (wrapper.style[key] = wrapperStyle[key]));
        }
    }, [wrapperStyle]);

    useEffect(() => {
        if (!size?.width || !size?.height) {
            return;
        }
        calculateRange();
    }, [size?.width, size?.height, list]);

    useEventListener(
        'scroll',
        e => {
            if (scrollTriggerByScrollToFunc.current) {
                scrollTriggerByScrollToFunc.current = false;
                return;
            }
            e.preventDefault();
            calculateRange();
        },
        {
            target: containerTarget,
        },
    );

    const scrollTo = (index: number) => {
        const container = getTargetElement(containerTarget);
        if (container) {
            scrollTriggerByScrollToFunc.current = true;
            container.scrollTop = getDistanceTop(index);
            calculateRange();
        }
    };

    return [targetList, useMemoizedFn(scrollTo)] as const;
};

export default useVirtualList;
