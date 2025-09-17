import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { type DashboardAPISchema } from '@/services/http';

interface DashboardListStore {
    /** Dashboard coverImages */
    coverImages: DashboardAPISchema['getDashboardPresetCovers']['response'];
    /** Update Dashboard coverImages */
    updateCoverImages: (images: DashboardAPISchema['getDashboardPresetCovers']['response']) => void;
}

/**
 * Dashboard list store global data
 */
const useDashboardListStore = create(
    immer<DashboardListStore>(set => ({
        coverImages: [],
        updateCoverImages(images) {
            set(state => {
                state.coverImages = images;
            });
        },
    })),
);

export default useDashboardListStore;
