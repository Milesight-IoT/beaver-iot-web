import { useMemo, useState, useContext, useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import { useRequest } from 'ahooks';

import {
    type EntityAPISchema,
    entityAPI,
    isRequestSuccess,
    getResponseData,
    awaitWrap,
} from '@/services/http';
import { useActivityEntity, useStableValue } from '@/components/drawing-board/plugin/hooks';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { type MarkerExtraInfoProps } from '../control-panel';

export interface useEntitiesProps {
    data?: MarkerExtraInfoProps[];
}

/**
 * Handle entities
 */
export function useEntities(props: useEntitiesProps) {
    const { data } = props || {};

    const [entitiesStatus, setEntitiesStatus] = useState<
        EntityAPISchema['getEntitiesStatus']['response']
    >({});

    const allEntities = useMemo(() => {
        if (!Array.isArray(data) || isEmpty(data)) {
            return;
        }

        /**
         * Get all important entities from data
         */
        return [...new Set(data.flatMap(item => Object.values(item?.entityKeyToId || {})))];
    }, [data]);
    const { stableValue: importantEntities } = useStableValue(allEntities);

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

    return {
        /**
         * Current devices all entities status
         */
        entitiesStatus,
    };
}
