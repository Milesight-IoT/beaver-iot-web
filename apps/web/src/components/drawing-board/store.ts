import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { BoardPluginProps } from './plugin/types';

interface DrawingBoardStore {
    /** plugins control panel */
    pluginsControlPanel: BoardPluginProps[];
    /** update all plugins control panel */
    updatePluginsControlPanel: (panels: BoardPluginProps[]) => void;
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
    })),
);

export default useDrawingBoardStore;
