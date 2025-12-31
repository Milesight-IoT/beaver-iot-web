import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import {
    useMqtt,
    MQTT_STATUS,
    MQTT_EVENT_TYPE,
    BATCH_PUSH_TIME,
    usePermissionsError,
} from '@/hooks';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { dashboardAPI, getResponseData, isRequestSuccess, awaitWrap } from '@/services/http';
import useDashboardStore, { type DrawingBoardPath } from '@/pages/dashboard/store';

/**
 * Get dashboard detail
 */
export function useDashboardDetail(drawingBoardId: ApiKey) {
    const [loading, setLoading] = useState(false);
    const { setLatestEntities, triggerEntityListener } = useActivityEntity();
    const { paths, setPath, resetPaths } = useDashboardStore();
    const { handlePermissionsError } = usePermissionsError();

    const { data: dashboardDetail, run: getDashboardDetail } = useRequest(
        async () => {
            try {
                setLoading(true);

                if (!drawingBoardId) return;
                const [error, resp] = await awaitWrap(
                    dashboardAPI.getDrawingBoardDetail({ canvas_id: drawingBoardId }),
                );

                if (error || !isRequestSuccess(resp)) {
                    handlePermissionsError(error);
                    return;
                }
                const data = getResponseData(resp);

                setLatestEntities(data?.entities || []);

                /**
                 * If the path exists, update it;
                 * If not, reset all paths.
                 */
                if (data) {
                    const isExisted = paths?.some(p => p.id === data.id);
                    const newPath: DrawingBoardPath = {
                        id: data.id,
                        name: data.name,
                        attach_id: data.attach_id,
                        attach_type: data.attach_type,
                    };

                    if (isExisted) {
                        setPath(newPath);
                    } else {
                        resetPaths([newPath]);
                    }
                }

                return data;
            } finally {
                setLoading(false);
            }
        },
        {
            debounceWait: 300,
            refreshDeps: [drawingBoardId],
        },
    );

    // ---------- Listen the entities change by Mqtt ----------
    const { status: mqttStatus, client: mqttClient } = useMqtt();

    // Subscribe the entity exchange topic
    useEffect(() => {
        if (!drawingBoardId || !mqttClient || mqttStatus !== MQTT_STATUS.CONNECTED) return;

        const removeTriggerListener = mqttClient.subscribe(MQTT_EVENT_TYPE.EXCHANGE, payload => {
            triggerEntityListener(payload.payload?.entity_ids || [], {
                dashboardId: drawingBoardId,
                payload,
                periodTime: BATCH_PUSH_TIME,
            });
        });

        return () => {
            removeTriggerListener?.();
            mqttClient?.unsubscribe(MQTT_EVENT_TYPE.EXCHANGE);
        };
    }, [mqttStatus, mqttClient, drawingBoardId, triggerEntityListener]);

    // Unsubscribe the topic when the dashboard page is unmounted
    // useEffect(() => {
    //     return () => {
    //         mqttClient?.unsubscribe(MQTT_EVENT_TYPE.EXCHANGE);
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return {
        loading,
        dashboardDetail,
        getDashboardDetail,
    };
}
