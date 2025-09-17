import { useMemoizedFn } from 'ahooks';

/**
 * Handle widget grid layout resize
 */
export function useWidgetResize(mainRef: any) {
    const handleGridLayoutResize = useMemoizedFn((...args) => {
        /**
         * Get position scroll the scrollbar to the bottom
         */
        const newTop = mainRef.current?.scrollHeight;
        /**
         * Get the position of the bottom of the drawing board grid layout
         */
        const { bottom } = mainRef.current?.getBoundingClientRect() || {};
        /** Get the current position of the mouse in the screen */
        const mouseY = args?.[4]?.y;
        if (Number.isNaN(bottom) || Number.isNaN(mouseY) || Number.isNaN(newTop)) return;

        /**
         * Unless the mouse position is outside the layout container
         * or returns directly
         */
        if (mouseY < bottom) return;

        /**
         * scroll the scrollbar to the bottom
         */
        mainRef.current?.scrollBy({
            top: mainRef.current?.scrollHeight,
            left: 0,
        });
    });

    return {
        /**
         * Handle widget grid layout resize
         */
        handleGridLayoutResize,
    };
}
