import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import {
    iotLocalStorage,
    DASHBOARD_DRAWING_BOARD_PATHS_KEY,
} from '@milesight/shared/src/utils/storage';

import { type AttachType } from '@/services/http';

export interface DrawingBoardPath {
    id: ApiKey;
    name: string;
    attach_type: AttachType;
    attach_id: ApiKey;
}

interface DashboardStore {
    /** Drawing board paths */
    paths: DrawingBoardPath[];
    /** To set drawing board paths */
    setPath: (path?: DrawingBoardPath) => void;
    /** To update path */
    updatePath: (path?: DrawingBoardPath) => void;
    /** Clear all drawing board paths */
    clearPaths: () => void;
    /** Reset all drawing board paths */
    resetPaths: (path?: DrawingBoardPath[]) => void;
}

/**
 * Dashboard drawing board store global data
 */
const useDashboardStore = create(
    immer<DashboardStore>((set, get) => ({
        paths: iotLocalStorage.getItem(DASHBOARD_DRAWING_BOARD_PATHS_KEY) || [],
        setPath(path) {
            if (!path) {
                return;
            }

            const { paths = [] } = get();
            const existedIndex = paths.findIndex(p => p.id === path.id);
            let newPaths: DrawingBoardPath[] = [];

            /**
             * If path does not exist, store it.
             */
            if (existedIndex === -1) {
                newPaths = [...paths, path];
            } else {
                /**
                 * If it exists, replace it with the lase one.
                 */
                newPaths = [...paths.slice(0, existedIndex), path];
            }

            set(() => ({ paths: newPaths }));
            iotLocalStorage.setItem(DASHBOARD_DRAWING_BOARD_PATHS_KEY, newPaths);
        },
        updatePath(path) {
            if (!path) {
                return;
            }

            const { paths = [] } = get();
            const isExisted = paths.some(p => p.id === path.id);
            if (!isExisted) {
                return;
            }

            const otherPaths = paths.filter(p => p.id !== path.id);
            const newPaths: DrawingBoardPath[] = [...otherPaths, path];

            set(() => ({ paths: newPaths }));
            iotLocalStorage.setItem(DASHBOARD_DRAWING_BOARD_PATHS_KEY, newPaths);
        },
        clearPaths() {
            set(() => ({ paths: [] }));
            iotLocalStorage.removeItem(DASHBOARD_DRAWING_BOARD_PATHS_KEY);
        },
        resetPaths(paths) {
            if (!paths) {
                return;
            }

            set(() => ({ paths }));
            iotLocalStorage.setItem(DASHBOARD_DRAWING_BOARD_PATHS_KEY, paths);
        },
    })),
);

export default useDashboardStore;
