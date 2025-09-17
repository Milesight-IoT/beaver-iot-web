import { useMemo, useEffect } from 'react';

import type { BaseControlConfig } from '@/components/drawing-board/plugin/types';
import useControlPanelStore from '@/components/drawing-board/plugin/store';

export interface UseControlProps {
    config?: BaseControlConfig;
}

/**
 * Handle Control config
 */
export function useControl(props: UseControlProps) {
    const { config } = props || {};

    const { formData, setValuesToFormConfig } = useControlPanelStore();

    /**
     * Get newest config by mapStateToProps
     */
    const newConfig = useMemo(() => {
        if (!config?.mapStateToProps) {
            return config;
        }

        const newest = config?.mapStateToProps?.(config, formData);
        if (!newest) {
            return config;
        }

        return newest;
    }, [config, formData]);

    /**
     * Whether control visibility
     */
    const isVisibility = useMemo(() => {
        if (!newConfig?.visibility) {
            return true;
        }

        return Boolean(newConfig.visibility(formData));
    }, [newConfig, formData]);

    /**
     * Set values to form data
     */
    useEffect(() => {
        if (!formData || !setValuesToFormConfig || !newConfig?.setValuesToFormConfig) return;

        newConfig.setValuesToFormConfig(setValuesToFormConfig, formData);
    }, [formData, setValuesToFormConfig, newConfig]);

    return {
        /**
         * Current control the newest config
         */
        newConfig,
        /**
         * a function that uses control panel props to check whether a control should be visible.
         */
        isVisibility,
    };
}
