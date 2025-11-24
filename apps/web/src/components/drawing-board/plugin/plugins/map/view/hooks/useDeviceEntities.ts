import { useMemo, useState, useContext, useEffect } from 'react';
import { isEmpty, get } from 'lodash-es';
import { useMemoizedFn, useRequest } from 'ahooks';

import {
    type ImportEntityProps,
    type DeviceDetail,
    type EntityAPISchema,
    type DeviceStatus,
    entityAPI,
    isRequestSuccess,
    getResponseData,
    awaitWrap,
} from '@/services/http';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type ColorType } from '@/components/map/components/marker';
import {
    DEVICE_STATUS_ENTITY_UNIQUE_ID,
    DEVICE_LATITUDE_ENTITY_UNIQUE_ID,
    DEVICE_LONGITUDE_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_TIME_ENTITY_UNIQUE_ID,
    DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID,
} from '@/constants';

export interface useDeviceEntitiesProps {
    isPreview?: boolean;
    data?: DeviceDetail[];
}

/**
 * Handle Devices entities
 */
export function useDeviceEntities(props: useDeviceEntitiesProps) {
    const { data } = props || {};

    const [entitiesStatus, setEntitiesStatus] = useState<
        EntityAPISchema['getEntitiesStatus']['response']
    >({});

    const importantEntities = useMemo(() => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return;
        }

        return data
            .reduce((a: ImportEntityProps[], c) => {
                const deviceStatusEntity = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_STATUS_ENTITY_UNIQUE_ID),
                );
                const deviceLatitudeEntity = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_LATITUDE_ENTITY_UNIQUE_ID),
                );
                const deviceLongitudeEntity = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_LONGITUDE_ENTITY_UNIQUE_ID),
                );
                const alarmStatus = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID),
                );
                const alarmTime = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_TIME_ENTITY_UNIQUE_ID),
                );
                const alarmContent = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID),
                );
                const temperature = c?.important_entities?.find(c =>
                    c.key?.includes('temperature'),
                );
                const moisture = c?.important_entities?.find(c => c.key?.includes('soil_moisture'));
                const conductivity = c?.important_entities?.find(c =>
                    c.key?.includes('conductivity'),
                );

                return [
                    ...a,
                    ...(deviceStatusEntity ? [deviceStatusEntity] : []),
                    ...(deviceLatitudeEntity ? [deviceLatitudeEntity] : []),
                    ...(deviceLongitudeEntity ? [deviceLongitudeEntity] : []),
                    ...(alarmStatus ? [alarmStatus] : []),
                    ...(alarmTime ? [alarmTime] : []),
                    ...(alarmContent ? [alarmContent] : []),
                    ...(temperature ? [temperature] : []),
                    ...(moisture ? [moisture] : []),
                    ...(conductivity ? [conductivity] : []),
                ];
            }, [])
            .map(d => d.id)
            .filter(Boolean);
    }, [data]);

    const { run: getNewestEntitiesStatus } = useRequest(
        async () => {
            if (!Array.isArray(importantEntities) || isEmpty(importantEntities)) {
                return;
            }

            const [error, resp] = await awaitWrap(
                entityAPI.getEntitiesStatus({
                    entity_ids: importantEntities,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);
            if (!result) {
                return;
            }

            setEntitiesStatus(result);
        },
        {
            debounceWait: 300,
            refreshDeps: [importantEntities],
        },
    );

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
            callback: getNewestEntitiesStatus,
            isRecord: false,
        });

        return () => {
            removeEventListener();
        };
    }, [
        widgetId,
        drawingBoardDetail?.id,
        importantEntities,
        addEntityListener,
        getNewestEntitiesStatus,
    ]);

    const getDeviceStatus = useMemoizedFn((device?: DeviceDetail): DeviceStatus | undefined => {
        const deviceStatusEntity = device?.common_entities?.find(c =>
            c.key?.includes(DEVICE_STATUS_ENTITY_UNIQUE_ID),
        );
        if (!deviceStatusEntity?.id) {
            return;
        }

        return get(entitiesStatus, String(deviceStatusEntity.id))?.value;
    });

    const getAlarmStatus = useMemoizedFn((device?: DeviceDetail): boolean | undefined => {
        const alarmStatusEntity = device?.common_entities?.find(c =>
            c.key?.includes(DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID),
        );
        if (!alarmStatusEntity?.id) {
            return;
        }

        return get(entitiesStatus, String(alarmStatusEntity.id))?.value;
    });

    const getNoOnlineDevicesCount = useMemoizedFn(() => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return 0;
        }

        /**
         * Filter devices with location
         */
        return data
            .filter(d => !!d?.location)
            .reduce((a: number, c) => {
                return getDeviceStatus?.(c) !== 'ONLINE' ? a + 1 : a;
            }, 0);
    });

    const getColorType = useMemoizedFn((device?: DeviceDetail): ColorType | undefined => {
        if (getDeviceStatus?.(device) !== 'ONLINE') {
            return 'disabled';
        }

        return getAlarmStatus?.(device) ? 'danger' : undefined;
    });

    const getAlarmDevicesCount = useMemoizedFn(() => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return 0;
        }

        return data.reduce((a: number, c) => {
            return getDeviceStatus?.(c) === 'ONLINE' && getAlarmStatus?.(c) ? a + 1 : a;
        }, 0);
    });

    return {
        /**
         * Current devices all entities status
         */
        entitiesStatus,
        /**
         * Get Device status
         */
        getDeviceStatus,
        /**
         * Statistics no online devices count
         */
        getNoOnlineDevicesCount,
        /**
         * Get color type by device status
         */
        getColorType,
        /**
         * Statistics alarm devices count
         */
        getAlarmDevicesCount,
        /**
         * Get newest entities status
         */
        getNewestEntitiesStatus,
    };
}
