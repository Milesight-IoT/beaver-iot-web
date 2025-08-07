import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AnyDict } from './types';

interface ControlPanelStore {
    /** Current form data */
    formData?: AnyDict;
    /** Update current form data data */
    updateFormData: (data?: AnyDict) => void;
    /**
     * Control panel config update effect
     */
    configUpdateEffect?: (data?: AnyDict) => void;
    /**
     * Register the config update effect
     */
    registerConfigUpdateEffect: (effect?: (data?: AnyDict) => void) => void;
    /**
     * Update the control panel config
     */
    updateConfig: (data: AnyDict) => void;
}

/**
 * The plugin control panel global data
 */
const useControlPanelStore = create(
    immer<ControlPanelStore>((set, get) => ({
        updateFormData(data) {
            set(state => {
                state.formData = data;
            });
        },
        registerConfigUpdateEffect(effect) {
            set(state => {
                state.configUpdateEffect = effect;
            });
        },
        updateConfig(data) {
            if (!data) return;

            const { configUpdateEffect } = get();
            if (!configUpdateEffect) {
                return;
            }

            set(state => {
                state.formData = data;
            });
            configUpdateEffect?.(data);
        },
    })),
);

export default useControlPanelStore;
