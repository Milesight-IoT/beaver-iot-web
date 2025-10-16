import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import { useActivityEntity } from '../../../../hooks';
import type { ViewConfigProps } from '../../typings';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    entity: ViewConfigProps['entity'];
}
export const useSource = (props: IProps) => {
    const { entity, widgetId, dashboardId } = props;

    const { data: entityStatus, run: getEntityStatusValue } = useRequest(
        async () => {
            if (!entity?.value) return;
            const { value } = entity || {};

            const [error, resp] = await awaitWrap(entityAPI.getEntityStatus({ id: value }));
            if (error || !isRequestSuccess(resp)) return;

            return getResponseData(resp);
        },
        {
            manual: true,
            debounceWait: 300,
        },
    );
    useEffect(() => {
        getEntityStatusValue();
    }, [entity?.value]);

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: getEntityStatusValue,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener, getEntityStatusValue]);

    return {
        entityStatus,
    };
};
