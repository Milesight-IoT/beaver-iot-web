import { createContext } from 'react';

import { type WidgetDetail } from '@/services/http';
import type { DrawingBoardProps } from './interface';

export interface DrawingBoardContextProps extends DrawingBoardProps {
    /**
     * 1. The widget plugin currently being displayed.
     * 2. The widget plugin currently being added.
     * 2. The widget plugin currently being edited.
     */
    widget?: WidgetDetail;
}

/**
 * The drawing board context data
 */
export const DrawingBoardContext = createContext<DrawingBoardContextProps | null>(null);
