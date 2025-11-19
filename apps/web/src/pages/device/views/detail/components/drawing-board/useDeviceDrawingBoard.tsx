import { useMemo, useState, useRef, useEffect } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isNil } from 'lodash-es';

import { useMqtt, MQTT_STATUS, MQTT_EVENT_TYPE, BATCH_PUSH_TIME } from '@/hooks';
import {
    dashboardAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceAPISchema,
    type DrawingBoardDetail,
} from '@/services/http';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';

export default function useDeviceDrawingBoard(
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>,
) {
    const { setLatestEntities, triggerEntityListener } = useActivityEntity();

    const [loadingDrawingBoard, setLoadingDrawingBoard] = useState<boolean>();
    const [drawingBoardDetail, setDrawingBoardDetail] = useState<DrawingBoardDetail>();
    const [drawingBoardId, setDrawingBoardId] = useState<ApiKey>();

    const drawingBoardIdRef = useRef<ApiKey>();

    const getNewestDrawingBoardDetail = useMemoizedFn(async () => {
        try {
            if (!loadingDrawingBoard) {
                setLoadingDrawingBoard(true);
            }

            if (!drawingBoardIdRef.current) {
                return;
            }

            const [error, resp] = await awaitWrap(
                dashboardAPI.getDrawingBoardDetail({
                    canvas_id: drawingBoardIdRef.current,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }
            const data = getResponseData(resp);

            setLatestEntities(data?.entities || []);

            setDrawingBoardDetail(data);
        } finally {
            setLoadingDrawingBoard(false);
        }
    });

    useRequest(
        async () => {
            try {
                const deviceId = deviceDetail?.id;
                if (!deviceId) {
                    return;
                }

                setLoadingDrawingBoard(true);

                const [error, resp] = await awaitWrap(
                    dashboardAPI.getDeviceDrawingBoard({
                        device_id: deviceId,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    setLoadingDrawingBoard(false);
                    return;
                }

                const result = getResponseData(resp);
                const newId = result?.canvas_id;

                drawingBoardIdRef.current = newId;
                setDrawingBoardId(newId);
                getNewestDrawingBoardDetail?.();
            } catch {
                setLoadingDrawingBoard(false);
            }
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceDetail?.id],
        },
    );

    const loading = useMemo(() => {
        return isNil(loadingDrawingBoard) || loadingDrawingBoard;
    }, [loadingDrawingBoard]);

    // ---------- Listen the entities change by Mqtt ----------
    const { status: mqttStatus, client: mqttClient } = useMqtt();

    // Subscribe the entity exchange topic
    useEffect(() => {
        if (!drawingBoardId || !mqttClient || mqttStatus !== MQTT_STATUS.CONNECTED) {
            return;
        }

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
    }, [drawingBoardId, mqttStatus, mqttClient, triggerEntityListener]);

    // Unsubscribe the topic when the dashboard page is unmounted
    // useEffect(() => {
    //     return () => {
    //         mqttClient?.unsubscribe(MQTT_EVENT_TYPE.EXCHANGE);
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return {
        loading,
        drawingBoardDetail,
        getNewestDrawingBoardDetail,
    };
}
