import { useState, useEffect } from 'react';
import { isNil } from 'lodash-es';

import { useTheme } from '@milesight/shared/src/hooks';
import { iotLocalStorage, MAIN_CANVAS_KEY } from '@milesight/shared/src/utils/storage';

import { dashboardAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

/**
 * First login on mobile devices will
 * take you directly to the main canvas
 */
export function useMainCanvas() {
    const { matchTablet } = useTheme();

    const [loading, setLoading] = useState(true);
    const [defaultId, setDefaultId] = useState<ApiKey>();

    useEffect(() => {
        const getMainCanvas = async () => {
            try {
                if (!matchTablet || !isNil(iotLocalStorage.getItem(MAIN_CANVAS_KEY))) {
                    setDefaultId(undefined);
                    return;
                }

                const [error, resp] = await awaitWrap(dashboardAPI.getDefaultMainDrawingBoard());
                if (error || !isRequestSuccess(resp)) {
                    iotLocalStorage.setItem(MAIN_CANVAS_KEY, '');
                    setDefaultId(undefined);
                    return;
                }

                const data = getResponseData(resp);
                const mainCanvasId = data?.main_canvas_id || '';

                setDefaultId(mainCanvasId);
                iotLocalStorage.setItem(MAIN_CANVAS_KEY, mainCanvasId);
            } finally {
                setLoading(false);
            }
        };

        getMainCanvas?.();
    }, [matchTablet]);

    return {
        loading,
        /**
         * First login on mobile devices will
         * take you directly to the main canvas
         */
        defaultId,
        setDefaultId,
    };
}
