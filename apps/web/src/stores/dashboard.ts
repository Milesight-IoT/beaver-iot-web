import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface DashboardStore {
    /**
     * dashboard is editing
     */
    isEditing?: boolean;

    /**
     * Update dashboard is editing status
     */
    updateIsEditing: (isEditing: boolean) => void;
}

const useDashboardStore = create(
    immer<DashboardStore>(set => ({
        isEditing: false,

        updateIsEditing: isEditing => set({ isEditing: Boolean(isEditing) }),
    })),
);

export default useDashboardStore;
