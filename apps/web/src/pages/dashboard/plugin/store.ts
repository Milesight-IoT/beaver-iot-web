import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { isPlainObject, isEmpty } from 'lodash-es';

interface ControlPanelStore {
    /** Current form data */
    formData?: AnyDict;
    /** Update current form data data */
    updateFormData: (data?: AnyDict) => void;
    /**
     * Control panel config update effect
     */
    configUpdateEffect?: (newData?: AnyDict, formData?: AnyDict) => void;
    /**
     * Register the config update effect
     */
    registerConfigUpdateEffect: (effect?: (newData?: AnyDict, formData?: AnyDict) => void) => void;
    /**
     * Update the control panel config form data
     */
    setValuesToFormConfig: (data: AnyDict) => void;
}

/**
 * Real-time form data when editing plugin
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
        setValuesToFormConfig(newData) {
            if (!isPlainObject(newData) || isEmpty(newData)) return;

            const { formData, configUpdateEffect } = get();
            if (!configUpdateEffect) {
                return;
            }

            set(state => {
                state.formData = {
                    ...formData,
                    ...newData,
                };
            });
            configUpdateEffect?.(newData, formData);
        },
    })),
);

export default useControlPanelStore;
