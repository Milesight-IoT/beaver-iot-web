import { useMemo, useContext, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash-es';
import { useRequest } from 'ahooks';

import {
    type ImportEntityProps,
    deviceAPI,
    isRequestSuccess,
    getResponseData,
    awaitWrap,
} from '@/services/http';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type DeviceSelectData } from '@/components/drawing-board/plugin/components';
import {
    DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_TIME_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID,
} from '@/constants';

export interface useDeviceEntitiesProps {
    isPreview?: boolean;
    devices?: DeviceSelectData[];
    refreshList?: () => void;
}

/**
 * Handle Devices entities
 */
export function useDeviceEntities(props: useDeviceEntitiesProps) {
    const { devices, refreshList } = props || {};

    const refreshListRef = useRef(refreshList);
    useEffect(() => {
        refreshListRef.current = refreshList;
    }, [refreshList]);

    const { data } = useRequest(
        async () => {
            if (!Array.isArray(devices) || isEmpty(devices)) {
                return;
            }

            const [error, resp] = await awaitWrap(
                deviceAPI.getList({
                    id_list: devices.map(d => d.id),
                    page_size: 100,
                    page_number: 1,
                }),
            );

            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);

            return result?.content || [];
        },
        {
            refreshDeps: [devices],
            debounceWait: 300,
        },
    );

    const importantEntities = useMemo(() => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return;
        }

        return data
            .reduce((a: ImportEntityProps[], c) => {
                const alarmStatus = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID),
                );
                const alarmTime = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_TIME_ENTITY_UNIQUE_ID),
                );
                const alarmContent = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID),
                );

                return [
                    ...a,
                    ...(alarmStatus ? [alarmStatus] : []),
                    ...(alarmTime ? [alarmTime] : []),
                    ...(alarmContent ? [alarmContent] : []),
                ];
            }, [])
            .map(d => d.id)
            .filter(Boolean);
    }, [data]);

    /** ---------- Entity status management ---------- */
    const { addEntityListener } = useActivityEntity();
    const context = useContext(DrawingBoardContext);
    const { widget, drawingBoardDetail } = context || {};

    /**
     * Widget id is required to listen entity status changes
     */
    const widgetId = useMemo(() => {
        return widget?.widget_id || widget?.tempId;
    }, [widget]);

    useEffect(() => {
        if (
            !widgetId ||
            !drawingBoardDetail?.id ||
            !Array.isArray(importantEntities) ||
            isEmpty(importantEntities)
        ) {
            return;
        }

        const removeEventListener = addEntityListener(importantEntities, {
            widgetId,
            dashboardId: drawingBoardDetail.id,
            callback: refreshListRef.current,
            isRecord: false,
        });

        return () => {
            removeEventListener();
        };
    }, [widgetId, drawingBoardDetail?.id, importantEntities, addEntityListener]);
}
