import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { BoardPluginProps } from './plugin/types';

interface DrawingBoardStore {
    /** plugins control panel */
    pluginsControlPanel: BoardPluginProps[];
    /** update all plugins control panel */
    updatePluginsControlPanel: (panels: BoardPluginProps[]) => void;
    /** The entire drawing board displayed in fullscreen */
    drawingBoardFullscreen: boolean;
    /** Set whether the entire drawing board displayed in fullscreen */
    setDrawingBoardFullscreen: (isFullscreen: boolean) => void;
}

/**
 * use drawing board global data
 */
const useDrawingBoardStore = create(
    immer<DrawingBoardStore>(set => ({
        pluginsControlPanel: [],
        updatePluginsControlPanel(panels) {
            set(() => ({ pluginsControlPanel: panels }));
        },
        drawingBoardFullscreen: false,
        setDrawingBoardFullscreen(isFullscreen) {
            set(() => ({ drawingBoardFullscreen: isFullscreen }));
        },
    })),
);

export default useDrawingBoardStore;
