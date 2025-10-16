import { useEffect, useRef, useState } from 'react';
import { isNil } from 'lodash-es';

import { plus, minus, times, divide } from '@milesight/shared/src/utils/number-precision';

export function useIconRemaining(percent: number) {
    const [realPercent, setRealPercent] = useState(100);
    const [newFontSize, setNewFontSize] = useState(124);

    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const percentRef = useRef(100);
    const fontSizeRef = useRef(124);

    const getRealPercent = (height: number, percent: number) => {
        if (!height || !percent) {
            return 100;
        }

        const pathRect = svgWrapperRef?.current
            ?.querySelector('svg')
            ?.firstElementChild?.getBoundingClientRect();
        const wrapperRect = svgWrapperRef?.current?.getBoundingClientRect();
        if (isNil(pathRect) || isNil(wrapperRect)) {
            return 100;
        }

        const padding = minus(pathRect.top, wrapperRect.top);
        const realPercent = divide(
            plus(padding, minus(pathRect.height - times(pathRect.height, times(percent, 0.01)))),
            height,
        );

        return Math.abs(realPercent * 100);
    };

    useEffect(() => {
        percentRef.current = percent;
        setRealPercent(getRealPercent(fontSizeRef.current, percent));
    }, [percent]);

    useEffect(() => {
        const containerNode = containerRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                setNewFontSize(rect ? Math.min(rect.width, rect.height - 22) : 124);
            }
        });

        if (containerNode) {
            resizeObserver.observe(containerNode);
        }

        /**
         * Unobserve
         */
        return () => {
            if (containerNode) {
                resizeObserver.unobserve(containerNode);
            }
        };
    }, []);

    useEffect(() => {
        fontSizeRef.current = newFontSize;
        setRealPercent(getRealPercent(newFontSize, percentRef.current));
    }, [newFontSize]);

    return {
        svgWrapperRef,
        containerRef,
        /**
         * Get svg real occupy percent
         */
        realPercent,
        /**
         * Get svg real occupy font size
         */
        newFontSize,
    };
}
