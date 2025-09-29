import { client, attachAPI, API_PREFIX } from './client';

export type FlowStatus = 'enable' | 'disable';

export type FlowNodeTraceInfo = {
    /** Node ID */
    node_id: ApiKey;
    /** Node Name */
    node_label: string;
    /** Running status */
    status: WorkflowNodeStatus;
    /** Start Time */
    start_time: number;
    /** Cost Time */
    time_cost: number;
    /** Input (JSON string) */
    input?: string;
    /** Output (JSON string) */
    output?: string;
    /** Message ID */
    message_id?: string;
    /** Error Message */
    error_message?: string;
    /** Parent Trace ID */
    parent_trace_id?: string;
};

export interface WorkflowAPISchema extends APISchema {
    /** Get workflow list */
    getList: {
        request: {
            name?: string;
            status?: FlowStatus;
            /** data per page */
            page_size?: number | null;
            /** pagination page numbers */
            page_number?: number | null;
        };
        response: SearchResponseType<
            {
                /** ID */
                id: ApiKey;
                /** Name */
                name: string;
                /** Remark */
                remark?: string;
                /** Enabled */
                enabled: boolean;
                /** Create Time */
                created_at: number;
                /** Update Time */
                updated_at: number;
                /** User Nickname */
                user_nickname: string;
                device_data?: {
                    /** Device ID */
                    id: ApiKey;
                    /** External ID */
                    identifier: ApiKey;
                    /** Device Name */
                    name: string;
                };
            }[]
        >;
    };

    /** Update a workflow */
    updateFlow: {
        request: {
            id: ApiKey;
            name: string;
            remark?: string;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Delete workflow */
    deleteFlows: {
        request: {
            workflow_id_list: ApiKey[];
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Import workflow from DSL */
    importFlow: {
        request: {
            dsl: unknown;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Export workflow as DSL */
    exportFlow: {
        request: {
            id: ApiKey;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Enable/Disable a workflow */
    enableFlow: {
        request: {
            id: ApiKey;
            status: FlowStatus;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Get workflow log list */
    getLogList: {
        request: SearchRequestType & {
            id: ApiKey;
            status?: WorkflowNodeStatus;
        };
        response: SearchResponseType<
            {
                /** ID */
                id: ApiKey;
                /** Start Time */
                start_time: number;
                /** Run Time (ms) */
                time_cost: number;
                /** Running status */
                status: WorkflowNodeStatus;
                /** Version */
                version: string;
            }[]
        >;
    };

    /** Get workflow log detail */
    getLogDetail: {
        request: {
            id: ApiKey;
        };
        response: {
            trace_info: FlowNodeTraceInfo[];
        };
    };

    /** Get workflow Design */
    getFlowDesign: {
        request: {
            id: ApiKey;
            version?: string;
        };
        response: {
            /** ID */
            id: ApiKey;
            /** Name */
            name: string;
            /** Remark */
            remark?: string;
            /** Enabled */
            enabled: boolean;
            /** Flow Version */
            version?: string;
            /** Design Data (JSON string) */
            design_data: string;
        };
    };

    /** Check workflow Design */
    checkFlowDesign: {
        request: {
            /** Flow Data (JSON string) */
            design_data: string;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Save workflow Design */
    saveFlowDesign: {
        request: {
            /** Flow ID (Empty means to create) */
            id?: ApiKey;
            /** Flow Version */
            version?: string;
            /** Flow Name */
            name: string;
            /** Flow Remark */
            remark?: string;
            /** Enabled */
            enabled?: boolean;
            /** Flow Design Data (JSON string) */
            design_data: string;
        };
        response: {
            /** ID */
            id: ApiKey;
            /** Flow Version */
            version: string;
        };
    };

    /** Test workflow */
    testFlow: {
        request: {
            /** Input Parameters */
            input?: Record<string, any>;
            /** Flow Design Data (JSON string) */
            design_data: any;
        };
        response: {
            /** Running Status */
            status: WorkflowNodeStatus;
            /** Flow ID */
            flow_id: ApiKey;
            /** Start Time */
            start_time: number;
            /** Run Time */
            time_cost: number;
            trace_infos: FlowNodeTraceInfo[];
        };
    };

    /** Test single node */
    testSingleNode: {
        request: {
            input?: Record<string, any>;
            /** Node Config (JSON string) */
            node_config: string;
        };
        response: FlowNodeTraceInfo;
    };

    /** Get workflow nodes info */
    getFlowNodes: {
        request: void;
        response: Record<
            WorkflowNodeCategoryType,
            {
                name: string;
                title: string;
                /** Form Schema (JSON string) */
                data?: string;
            }[]
        >;
    };

    /** Get node form schema */
    getNodeForm: {
        request: {
            /** The Backend Node Name */
            name: string;
        };
        response: unknown;
    };

    /** Get code langs */
    getCodeLangs: {
        request: void;
        response: {
            code: string[];
            expression: string[];
        };
    };
}

/**
 * Workflow API Service
 */
export default attachAPI<WorkflowAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/workflow/flows/search`,
        updateFlow: `PUT ${API_PREFIX}/workflow/flows/:id`,
        deleteFlows: `POST ${API_PREFIX}/workflow/flows/batch-delete`,
        importFlow: `POST ${API_PREFIX}/workflow/flows/import`,
        exportFlow: `GET ${API_PREFIX}/workflow/flows/:id/export`,
        enableFlow: `GET ${API_PREFIX}/workflow/flows/:id/:status`,
        getLogList: `POST ${API_PREFIX}/workflow/flows/:id/logs/search`,
        getLogDetail: `GET ${API_PREFIX}/workflow/flows/logs/:id`,
        getFlowDesign: `GET ${API_PREFIX}/workflow/flows/:id/design?version=:version`,
        checkFlowDesign: `POST ${API_PREFIX}/workflow/flows/design/validate`,
        saveFlowDesign: `POST ${API_PREFIX}/workflow/flows/design`,
        testFlow: `POST ${API_PREFIX}/workflow/flows/design/test`,
        testSingleNode: `POST ${API_PREFIX}/workflow/flows/node/test`,
        getFlowNodes: `GET ${API_PREFIX}/workflow/components`,
        getNodeForm: `GET ${API_PREFIX}/workflow/components/:id`,
        getCodeLangs: `GET ${API_PREFIX}/workflow/components/languages`,
    },
});
