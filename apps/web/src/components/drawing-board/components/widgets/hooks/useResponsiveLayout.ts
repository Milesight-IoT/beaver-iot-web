import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { type Layout } from 'react-grid-layout';

import { useTheme, useMediaQuery } from '@milesight/shared/src/hooks';

import { type WidgetDetail } from '@/services/http/dashboard';
import { type BoardPluginProps } from '@/components/drawing-board/plugin/types';
import { PC_LAYOUT_COLS } from '@/components/drawing-board/constants';

/**
 * Responsive layout based on screen size
 */
export function useResponsiveLayout(widgets: WidgetDetail[]) {
    const { breakpoints } = useTheme();
    const smallScreenSize = useMediaQuery(breakpoints.down('md'));
    const mediumScreenSize = useMediaQuery(breakpoints.between('md', 'xl'));

    const gridLayoutCols = useMemo(() => {
        if (smallScreenSize) {
            return 4;
        }

        if (mediumScreenSize) {
            return 6;
        }

        return PC_LAYOUT_COLS;
    }, [smallScreenSize, mediumScreenSize]);

    const gridRowHeight = useMemo(() => {
        if (smallScreenSize) {
            return 72;
        }

        return 88;
    }, [smallScreenSize]);

    const minWidth = useMemoizedFn((plugin: BoardPluginProps) => {
        return plugin?.minCol || 2;
    });

    const maxWidth = useMemoizedFn((plugin: BoardPluginProps) => {
        const maxCol = plugin?.maxCol;
        const currentW = plugin?.pos?.w || plugin?.minCol || 2;

        const allowedMaxW = Math.max(gridLayoutCols - (plugin?.pos?.x || 0), currentW);
        if (!maxCol) {
            return allowedMaxW;
        }

        return Math.min(maxCol, allowedMaxW);
    });

    const minHeight = useMemoizedFn((plugin: BoardPluginProps) => {
        return plugin?.minRow || 2;
    });

    const maxHeight = useMemoizedFn((plugin: BoardPluginProps) => {
        return plugin?.maxRow || 6;
    });

    const getSmallScreenWidth = useMemoizedFn((plugin: BoardPluginProps, defaultWidth: number) => {
        const width = defaultWidth > gridLayoutCols / 2 ? gridLayoutCols : defaultWidth;

        switch (plugin.type) {
            case 'dataCard':
            case 'switch':
            case 'trigger':
            case 'progress':
                return width < 2 ? 2 : width;
            default:
                return width;
        }
    });

    const getMediumScreenWidth = useMemoizedFn((defaultWidth: number) => {
        return defaultWidth > gridLayoutCols / 2 ? gridLayoutCols : defaultWidth;
    });

    const currentWidth = useMemoizedFn((plugin: BoardPluginProps) => {
        const defaultWidth = Math.max(plugin?.pos?.w || plugin?.minCol || 2, minWidth(plugin));

        if (smallScreenSize) {
            return getSmallScreenWidth(plugin, defaultWidth);
        }

        if (mediumScreenSize) {
            return getMediumScreenWidth(defaultWidth);
        }

        return defaultWidth;
    });

    const currentHeight = useMemoizedFn((plugin: BoardPluginProps) => {
        const height = Math.max(plugin?.pos?.h || plugin?.minRow || 2, minHeight(plugin));

        switch (plugin.type) {
            case 'deviceList':
            case 'alarm':
                return smallScreenSize && (widgets?.length || 0) > 1 ? 4 : height;
            default:
                return height;
        }
    });

    /**
     * Generate grid layout
     * The greed masonry layout algorithm
     */
    const generateGridLayout = useMemoizedFn((items: Map<ApiKey, Layout>, cols: number = 6) => {
        /**
         * Store the maximum height of each column
         */
        const colHeights = Array(cols).fill(0);

        for (const [_, position] of items) {
            /**
             * Update width, can not exceed cols
             */
            if (position.w > cols) {
                position.w = cols;
            }

            let bestY = Number.POSITIVE_INFINITY;
            let bestX = -1;

            for (let x = 0; x <= cols - position.w; x++) {
                /**
                 * Compute y = max(colHeights[x...x+item.w-1])
                 */
                let y = 0;
                for (let j = x; j < x + position.w; j++) {
                    if (colHeights[j] > y) y = colHeights[j];
                }

                /**
                 * Choose smaller y, tie-breaker smaller x (leftmost)
                 */
                if (y < bestY || (y === bestY && (bestX === -1 || x < bestX))) {
                    bestY = y;
                    bestX = x;
                }
            }

            /**
             * Update placement
             */
            position.x = bestX;
            position.y = bestY;

            /**
             * Update colHeights
             */
            for (let k = bestX; k < bestX + position.w; k++) {
                colHeights[k] = bestY + position.h;
            }
        }

        return items;
    });

    const positionWidgets = useMemo((): Map<ApiKey, Layout> => {
        const positionMap: Map<ApiKey, Layout> = new Map();

        /**
         * Sort from top to bottom and left to right.
         */
        widgets
            .sort((a, b) => {
                const aX = a?.data?.pos?.x || 0;
                const aY = a?.data?.pos?.y || 0;
                const bX = b?.data?.pos?.x || 0;
                const bY = b?.data?.pos?.y || 0;

                if (aY !== bY) {
                    return aY - bY;
                }

                return aX - bX;
            })
            .forEach(widget => {
                const id = (widget.widget_id || widget.tempId) as ApiKey;
                const plugin = widget.data as BoardPluginProps;

                const newWidth = currentWidth(plugin);
                const newHeight = currentHeight(plugin);
                const newMinWidth = minWidth(plugin);
                const newMinHeight = minHeight(plugin);

                const pos: Layout = {
                    ...plugin.pos,
                    w: newWidth,
                    h: newHeight,
                    minW: newMinWidth,
                    minH: newMinHeight,
                    maxW: Math.max(maxWidth(plugin), newWidth, newMinWidth),
                    maxH: Math.max(maxHeight(plugin), newHeight, newMinHeight),
                    i: String(id),
                    x: plugin.pos?.x || 0,
                    y: plugin.pos?.y || 0,
                };

                positionMap.set(id, pos);
            });

        /**
         * New greed masonry layout algorithm
         */
        if (gridLayoutCols !== PC_LAYOUT_COLS) {
            return generateGridLayout(positionMap, gridLayoutCols);
        }

        return positionMap;
    }, [
        gridLayoutCols,
        widgets,
        generateGridLayout,
        currentHeight,
        currentWidth,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
    ]);

    return {
        smallScreenSize,
        mediumScreenSize,
        gridLayoutCols,
        gridRowHeight,
        positionWidgets,
        currentWidth,
        currentHeight,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
    };
}
