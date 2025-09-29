import { useEffect, useRef, useState, useMemo } from 'react';

export function useContainerRect() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | undefined>();

    useEffect(() => {
        const containerNode = containerRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setContainerRect(entry?.target?.getBoundingClientRect());
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

    const showIconWidth = useMemo(() => {
        return (containerRect?.width || 0) >= 104;
    }, [containerRect]);

    return {
        containerRef,
        containerRect,
        /**
         * show the icon when the container width is greater than or equal to 104
         */
        showIconWidth,
    };
}
