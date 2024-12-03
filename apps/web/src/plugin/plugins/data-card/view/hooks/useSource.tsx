import { useEffect, useMemo } from 'react';
import { useRequest } from 'ahooks';
import ws, { getExChangeTopic } from '@/services/ws';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import type { ViewConfigProps } from '../../typings';

interface IProps {
    entity: ViewConfigProps['entity'];
}
export const useSource = (props: IProps) => {
    const { entity } = props;

    const { data: entityStatusValue, runAsync: getEntityStatusValue } = useRequest(
        async () => {
            if (!entity) return;
            const { value } = entity || {};

            const [error, resp] = await awaitWrap(entityAPI.getEntityStatus({ id: value }));
            if (error || !isRequestSuccess(resp)) return;

            return getResponseData(resp)?.value;
        },
        { manual: true },
    );
    useEffect(() => {
        getEntityStatusValue();
    }, [entity]);

    const topic = useMemo(() => {
        const entityKey = entity?.rawData?.entityKey?.toString();
        return entityKey && getExChangeTopic(entityKey);
    }, [entity]);
    // 订阅 WS 主题
    useEffect(() => {
        if (!topic) return;

        return ws.subscribe(topic, getEntityStatusValue);
    }, [topic]);

    return {
        entityStatusValue,
    };
};
