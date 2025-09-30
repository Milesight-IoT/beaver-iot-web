import { useMemo, useState, useContext, useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import { useRequest } from 'ahooks';

import {
    type ImportEntityProps,
    type DeviceDetail,
    type EntityAPISchema,
    entityAPI,
    isRequestSuccess,
    getResponseData,
    awaitWrap,
} from '@/services/http';
import { useActivityEntity } from '@/components/drawing-board/plugin/hooks';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { DEVICE_STATUS_ENTITY_UNIQUE_ID } from '@/constants';

export interface useDeviceEntitiesProps {
    isPreview?: boolean;
    data?: DeviceDetail[];
}

/**
 * Handle Devices entities
 */
export function useDeviceEntities(props: useDeviceEntitiesProps) {
    const { isPreview, data } = props || {};

    const [entitiesStatus, setEntitiesStatus] = useState<
        EntityAPISchema['getEntitiesStatus']['response']
    >({});

    const importantEntities = useMemo(() => {
        if (isPreview || !Array.isArray(data) || isEmpty(data)) {
            return;
        }

        return data
            .reduce((a: ImportEntityProps[], c) => {
                const deviceStatusEntity = c?.common_entities?.find(c =>
                    c.key?.includes(DEVICE_STATUS_ENTITY_UNIQUE_ID),
                );

                const propertiesEntities = c?.important_entities?.filter(
                    e => e.type === 'PROPERTY',
                );

                return [
                    ...a,
                    ...(deviceStatusEntity ? [deviceStatusEntity] : []),
                    ...(propertiesEntities || []),
                ];
            }, [])
            .map(d => d.id)
            .filter(Boolean);
    }, [data, isPreview]);

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

    useEffect(() => {
        if (
            !widget?.widget_id ||
            !drawingBoardDetail?.id ||
            !Array.isArray(importantEntities) ||
            isEmpty(importantEntities)
        ) {
            return;
        }

        const removeEventListener = addEntityListener(importantEntities, {
            widgetId: widget.widget_id,
            dashboardId: drawingBoardDetail.id,
            callback: getNewestEntitiesStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [widget, drawingBoardDetail, importantEntities, addEntityListener, getNewestEntitiesStatus]);

    return {
        /**
         * Current devices all entities status
         */
        entitiesStatus,
    };
}
