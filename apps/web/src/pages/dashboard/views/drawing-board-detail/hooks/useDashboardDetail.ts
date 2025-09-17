import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { useMqtt, MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME } from '@/hooks';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { dashboardAPI, getResponseData, isRequestSuccess, awaitWrap } from '@/services/http';
import useDashboardStore from '@/pages/dashboard/store';

/**
 * Get dashboard detail
 */
export function useDashboardDetail(drawingBoardId: ApiKey) {
    const [loading, setLoading] = useState(false);
    const { setLatestEntities, triggerEntityListener } = useActivityEntity();
    const { setPath } = useDashboardStore();

    const { data: dashboardDetail, run: getDashboardDetail } = useRequest(
        async () => {
            try {
                setLoading(true);

                if (!drawingBoardId) return;
                const [error, resp] = await awaitWrap(
                    dashboardAPI.getDrawingBoardDetail({ canvas_id: drawingBoardId }),
                );

                if (error || !isRequestSuccess(resp)) return;
                const data = getResponseData(resp);

                setLatestEntities(data?.entities || []);
                setPath(data);
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

        return removeTriggerListener;
    }, [mqttStatus, mqttClient, drawingBoardId, triggerEntityListener]);

    // Unsubscribe the topic when the dashboard page is unmounted
    useEffect(() => {
        return () => {
            mqttClient?.unsubscribe(MQTT_EVENT_TYPE.EXCHANGE);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        loading,
        dashboardDetail,
        getDashboardDetail,
    };
}
