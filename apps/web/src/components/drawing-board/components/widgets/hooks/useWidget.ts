import { useContext } from 'react';
import { useMemoizedFn } from 'ahooks';

import {
    DrawingBoardContext,
    type DrawingBoardContextProps,
} from '@/components/drawing-board/context';
import type { WidgetDetail } from '@/services/http/dashboard';

export function useWidget() {
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
    };
}
