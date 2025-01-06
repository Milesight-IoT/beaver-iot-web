import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { awaitWrap, getResponseData, workflowAPI, type FlowNodeTraceInfo } from '@/services/http';
import type { LogRenderListType, WorkflowData } from '../../../types';
import type { WorkflowDataType } from '../../../../action-log/types';

export const useLogDetail = ({
    activeItem,
    data,
}: {
    activeItem?: LogRenderListType;
    data: WorkflowData;
}) => {
    const [loading, setLoading] = useState(false);
    const [actionLogResult, setActionLogResult] = useState<
        [WorkflowDataType | void, FlowNodeTraceInfo[]]
    >([void 0, []]);
    const [workflowData, traceData] = actionLogResult || [];

    // Interface to obtain log details
    const { runAsync: getLogDetail } = useRequest(
        async () => {
            if (!activeItem) return [];

            const { id } = activeItem || {};
            const [error, resp] = await awaitWrap(workflowAPI.getLogDetail({ id }));
            if (error) return [];

            return getResponseData(resp)?.trace_info || [];
        },
        { manual: true },
    );
    // Interface to obtain the design of the workflow
    const { runAsync: getFlowDesign } = useRequest(
        async () => {
            if (!activeItem) return;

            const { id } = data || {};
            const resp = await workflowAPI.getFlowDesign({
                id,
                version: activeItem.version,
            });

            const designData = getResponseData(resp)?.design_data;
            if (!designData) return;

            try {
                return JSON.parse(designData) as WorkflowDataType;
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
            }
        },
        { manual: true },
    );

    /** get data function */
    const getList = async () => {
        setLoading(true);
        const [_, result] = await awaitWrap(Promise.all([getFlowDesign(), getLogDetail()]));
        setLoading(false);

        const [workflowData, traceData] = result || [];
        setActionLogResult([workflowData, traceData || []]);
    };
    useEffect(() => {
        if (!activeItem) return;

        getList();
    }, [activeItem]);

    return {
        actionLoading: loading,
        workflowData,
        traceData,
    };
};
