import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';

import { useMqtt, MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME } from '@/hooks';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { dashboardAPI, getResponseData, isRequestSuccess, awaitWrap } from '@/services/http';
import useDashboardStore from '@/pages/new-dashboard/store';

/**
 * Get dashboard detail
 */
export function useDashboardDetail(currentDashboardId: ApiKey) {
    const [loading, setLoading] = useState(false);
    const { setLatestEntities, triggerEntityListener } = useActivityEntity();
    const { setPath } = useDashboardStore();

    const { data: dashboardDetail, run: getDashboardDetail } = useRequest(
        async () => {
            try {
                setLoading(true);

                if (!currentDashboardId) return;
                const [error, resp] = await awaitWrap(
                    dashboardAPI.getDashboardDetail({ id: currentDashboardId }),
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
            refreshDeps: [currentDashboardId],
        },
    );

    // ---------- Listen the entities change by Mqtt ----------
    const { status: mqttStatus, client: mqttClient } = useMqtt();

    // Subscribe the entity exchange topic
    useEffect(() => {
        if (!currentDashboardId || !mqttClient || mqttStatus !== MQTT_STATUS.CONNECTED) return;

        const removeTriggerListener = mqttClient.subscribe(MQTT_EVENT_TYPE.EXCHANGE, payload => {
            triggerEntityListener(payload.payload?.entity_ids || [], {
                dashboardId: currentDashboardId,
                payload,
                periodTime: BATCH_PUSH_TIME,
            });
        });

        return removeTriggerListener;
    }, [mqttStatus, mqttClient, currentDashboardId, triggerEntityListener]);

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
