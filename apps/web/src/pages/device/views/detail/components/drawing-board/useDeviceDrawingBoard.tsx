import { useMemo, useState, useRef } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isNil } from 'lodash-es';

import {
    dashboardAPI,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type DeviceAPISchema,
    type DrawingBoardDetail,
} from '@/services/http';

export default function useDeviceDrawingBoard(
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>,
) {
    const [loadingCanvasId, setLoadingCanvasId] = useState<boolean>();
    const [loadingDrawingBoard, setLoadingDrawingBoard] = useState<boolean>();
    const [drawingBoardDetail, setDrawingBoardDetail] = useState<DrawingBoardDetail>();
    const canvasIdRef = useRef<ApiKey>();

    const getNewestDrawingBoardDetail = useMemoizedFn(async () => {
        try {
            setLoadingDrawingBoard(true);

            if (!canvasIdRef.current) {
                return;
            }

            const [error, resp] = await awaitWrap(
                dashboardAPI.getDrawingBoardDetail({
                    canvas_id: canvasIdRef.current,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }
            const data = getResponseData(resp);

            setDrawingBoardDetail(data);
        } finally {
            setLoadingDrawingBoard(false);
        }
    });

    useRequest(
        async () => {
            try {
                setLoadingCanvasId(true);

                const deviceId = deviceDetail?.id;
                if (!deviceId) {
                    return;
                }

                const [error, resp] = await awaitWrap(
                    dashboardAPI.getDeviceDrawingBoard({
                        device_id: deviceId,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                const result = getResponseData(resp);
                const canvasId = result?.canvas_id;

                canvasIdRef.current = canvasId;
                getNewestDrawingBoardDetail?.();
            } finally {
                setLoadingCanvasId(false);
            }
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceDetail],
        },
    );

    const loading = useMemo(() => {
        return (
            isNil(loadingCanvasId) ||
            isNil(loadingDrawingBoard) ||
            loadingCanvasId ||
            loadingDrawingBoard
        );
    }, [loadingCanvasId, loadingDrawingBoard]);

    return {
        loading,
        drawingBoardDetail,
        getNewestDrawingBoardDetail,
    };
}
