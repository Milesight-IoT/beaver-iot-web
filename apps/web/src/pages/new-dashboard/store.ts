import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type DashboardDetail } from '@/services/http';

interface DashboardStore {
    /** Drawing board paths */
    paths: DashboardDetail[];
    /** To set drawing board paths */
    setPath: (path?: DashboardDetail) => void;
    /** Clear all drawing board paths */
    clearPaths: () => void;
}

/**
 * Dashboard drawing board store global data
 */
const useDashboardStore = create(
    immer<DashboardStore>((set, get) => ({
        paths: [],
        setPath(path) {
            if (!path) {
                return;
            }

            const { paths = [] } = get();
            const existedIndex = paths.findIndex(p => p.dashboard_id === path.dashboard_id);
            /**
             * If path does not exist, store it.
             */
            if (existedIndex === -1) {
                set(() => ({ paths: [...paths, path] }));
            } else {
                /**
                 * If it exists, replace it with the lase one.
                 */
                set(() => ({ paths: paths.slice(0, existedIndex + 1) }));
            }
        },
        clearPaths() {
            set(() => ({ paths: [] }));
        },
    })),
);

export default useDashboardStore;
