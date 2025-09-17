import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CoverCroppingStore {
    /**
     * Get canvas cover cropping image function
     */
    getCanvasCroppingImage?: () => Promise<string | null>;
    updateGetCanvasCroppingImage: (func: () => Promise<string | null>) => void;
}

const useCoverCroppingStore = create(
    immer<CoverCroppingStore>(set => ({
        updateGetCanvasCroppingImage(func) {
            set(state => {
                state.getCanvasCroppingImage = func;
            });
        },
    })),
);

export default useCoverCroppingStore;
