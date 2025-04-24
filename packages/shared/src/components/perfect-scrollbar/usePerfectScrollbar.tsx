import { useLayoutEffect, useRef, useState, useCallback } from 'react';

export type Options = {
    /** Disable scrollbars */
    disabled?: boolean;
    /** Manually triggered scrollbar update */
    shouldUpdateKey?: string;
    /** Roll bar container */
    innerRef?: React.RefObject<HTMLDivElement>;
    /** Scroll bar container style */
    innerStyles?: React.CSSProperties;
};

/**
 * System scroll bar width
 */
const OS_SCROLLBAR_WIDTH = (() => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    outer.style.overflow = 'scroll';
    outer.style.width = '100%';
    inner.style.width = '100%';

    document.body.appendChild(outer);
    outer.appendChild(inner);
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.removeChild(inner);
    document.body.removeChild(outer);

    return scrollbarWidth;
})();

/**
 * Scrollbar width (use the default value of 20 for systems that automatically hide the scrollbar)
 */
export const SCROLLBAR_WIDTH = OS_SCROLLBAR_WIDTH || 20;

/**
 * Hide native scrollbars with right negative margins
 *
 * Inspired By Vitor's SimpleScrollbar library (vanilla JS):
 * https://github.com/buzinas/simple-scrollbar
 */
export default function usePerfectScrollbar(
    content: React.ReactNode,
    { disabled, shouldUpdateKey, innerRef, innerStyles }: Options = {},
) {
    const [scrollRatio, setScrollRatio] = useState(1);
    const [isDraggingTrack, setIsDraggingTrack] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const scrollerRef = innerRef || ref;
    const trackRef = useRef<HTMLDivElement>(null);
    const trackAnimationRef = useRef<number>();
    const memoizedProps = useRef<Record<string, any>>({});

    useLayoutEffect(() => {
        const el = scrollerRef.current;
        let scrollbarAnimation: number;

        const updateScrollbar = () => {
            cancelAnimationFrame(scrollbarAnimation);
            scrollbarAnimation = requestAnimationFrame(() => {
                const { clientHeight, scrollHeight } = el!;

                setScrollRatio(clientHeight / scrollHeight);
                memoizedProps.current = {
                    clientHeight,
                    scrollHeight,
                    trackHeight: trackRef.current?.clientHeight,
                };
            });
        };

        window.addEventListener('resize', updateScrollbar);
        updateScrollbar();

        return () => {
            cancelAnimationFrame(scrollbarAnimation);
            window.removeEventListener('resize', updateScrollbar);
        };
    }, [scrollerRef, shouldUpdateKey, content]);

    useLayoutEffect(() => {
        if (!disabled) return;
        const el = scrollerRef.current;

        const onWheel = (e: any) => e.preventDefault();
        el!.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            el!.removeEventListener('wheel', onWheel);
        };
    }, [scrollerRef, disabled]);

    const onScroll = useCallback(() => {
        if (scrollRatio === 1) return;
        const el = scrollerRef.current;
        const track = trackRef.current;

        cancelAnimationFrame(trackAnimationRef.current!);

        trackAnimationRef.current = requestAnimationFrame(() => {
            const { clientHeight, scrollHeight, trackHeight } = memoizedProps.current;

            const { height } = track?.getBoundingClientRect() || {};
            const newTrackHeight = height || trackHeight;

            const ratio = el!.scrollTop / (scrollHeight - clientHeight);
            const y = ratio * (clientHeight - newTrackHeight);

            if (track) track.style.transform = `translateY(${y}px)`;
        });
    }, [scrollerRef, scrollRatio]);

    const moveTrack = useCallback(
        (e: any) => {
            const el = scrollerRef.current;
            let moveAnimation: number;
            let lastPageY = e.pageY;
            let lastScrollTop = el!.scrollTop;

            setIsDraggingTrack(true);

            const drag = ({ pageY }: any) => {
                cancelAnimationFrame(moveAnimation);
                moveAnimation = requestAnimationFrame(() => {
                    const delta = pageY - lastPageY;
                    lastScrollTop += delta / scrollRatio;
                    lastPageY = pageY;
                    el!.scrollTop = lastScrollTop;
                });
            };

            const stop = () => {
                setIsDraggingTrack(false);
                window.removeEventListener('mousemove', drag);
            };

            window.addEventListener('mousemove', drag);
            window.addEventListener('mouseup', stop, { once: true });
        },
        [scrollerRef, scrollRatio],
    );

    const wrapperProps = {
        style: {
            marginLeft: `-${SCROLLBAR_WIDTH}px`,
        },
    };

    const scrollerProps = {
        ref: scrollerRef,
        onScroll: disabled ? undefined : onScroll,
        style: {
            ...innerStyles,
            right: `-${SCROLLBAR_WIDTH}px`,
            padding: `0 ${SCROLLBAR_WIDTH}px 0 0`,
            width: `calc(100% + ${OS_SCROLLBAR_WIDTH}px)`,
        },
    };

    const trackProps = {
        ref: trackRef,
        onMouseDown: disabled ? undefined : moveTrack,
        style: {
            right: isDraggingTrack ? 0 : undefined,
            width: isDraggingTrack ? 8 : undefined,
            height: `${scrollRatio * 100}%`,
            opacity: isDraggingTrack ? 1 : undefined,
            display: disabled || scrollRatio === 1 ? 'none' : undefined,
        },
    };

    return [wrapperProps, scrollerProps, trackProps];
}
