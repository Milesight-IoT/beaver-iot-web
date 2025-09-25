import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useTheme, useMediaQuery } from '@milesight/shared/src/hooks';

import { type WidgetDetail } from '@/services/http/dashboard';
import { type BoardPluginProps } from '@/components/drawing-board/plugin/types';

/**
 * Responsive layout based on screen size
 */
export function useResponsiveLayout(weights: WidgetDetail[]) {
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

        return 12;
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
                return smallScreenSize && (weights?.length || 0) > 1 ? 4 : height;
            default:
                return height;
        }
    });

    return {
        smallScreenSize,
        mediumScreenSize,
        gridLayoutCols,
        gridRowHeight,
        currentWidth,
        currentHeight,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
    };
}
