import { useContext, useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import {
    DrawingBoardContext,
    type DrawingBoardContextProps,
} from '@/components/drawing-board/context';
import type { WidgetDetail } from '@/services/http/dashboard';

export function useWidget() {
    const [pluginFullscreen, setPluginFullscreen] = useState<Record<string, boolean>>({});
    const drawingBoardContext = useContext(DrawingBoardContext);

    const newDrawingBoardContext = useMemoizedFn(
        (widget: WidgetDetail): DrawingBoardContextProps | null => {
            if (!drawingBoardContext) {
                return null;
            }

            return {
                ...drawingBoardContext,
                widget,
            };
        },
    );

    return {
        /**
         * The context of drawing board widget
         */
        newDrawingBoardContext,
        /**
         * Whether the plugin is fullscreen
         */
        pluginFullscreen,
        /**
         * Set whether the plugin is fullscreen
         */
        setPluginFullscreen,
    };
}
