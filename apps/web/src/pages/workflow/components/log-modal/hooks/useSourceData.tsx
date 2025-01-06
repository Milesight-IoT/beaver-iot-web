import { useRequest } from 'ahooks';
import { getResponseData, workflowAPI } from '@/services/http';
import type { PaginationModel, WorkflowData } from '../types';

export const useSourceData = ({ data }: { data: WorkflowData }) => {
    const { runAsync: getLogList } = useRequest(
        async (pageInfo: PaginationModel) => {
            const { id } = data || {};
            const { page, pageSize } = pageInfo || {};

            const resp = await workflowAPI.getLogList({
                id,
                page_number: page,
                page_size: pageSize,
            });
            return getResponseData(resp)!;
        },
        { manual: true },
    );

    return {
        getLogList,
    };
};
