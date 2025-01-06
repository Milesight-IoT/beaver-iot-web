import { type WorkflowAPISchema } from '@/services/http';

export interface LogItemProps {
    /**
     * Key for Component render
     */
    id: string | number;
    /**
     * Node status
     */
    status: WorkflowNodeStatus;
    /**
     * Title
     */
    title: string;
    /**
     * Version
     */
    version: string;
}

export type LogListPageType = WorkflowAPISchema['getLogList']['response'];

export interface PaginationModel {
    page: number;
    pageSize: number;
}

export type LogRenderListType = LogItemProps & { $$isFooterNode?: boolean };

export interface InfiniteScrollType {
    list: LogRenderListType[];
    source: LogListPageType;
    hasMore: boolean;
}

export type WorkflowData = ObjectToCamelCase<
    WorkflowAPISchema['getList']['response']['content'][number]
>;
