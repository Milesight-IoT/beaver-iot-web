import { client, attachAPI, API_PREFIX } from './client';

export type WorkflowStatus = 'enabled' | 'disabled';

export interface WorkflowAPISchema extends APISchema {
    /** Get workflow list */
    getList: {
        request: {
            name?: string;
            status?: WorkflowStatus;
        };
        response: {
            /** ID */
            id: ApiKey;
            /** Name */
            name: string;
            /** Reamrk */
            description: string;
            /** Create Time */
            created_at: number;
            /** Update Time */
            updated_at: number;
            /** Enabled */
            enabled: boolean;
            /** User Email */
            user_email: string;
        };
    };

    /** Add a workflow */
    addFlow: {
        request: {
            name: string;
            remark?: string;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
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

    /** Delete a workflow */
    deleteFlow: {
        request: {
            id: ApiKey;
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
            status: WorkflowStatus;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Get workflow log list */
    getLogList: {
        request: {
            // TODO: use workflow log status enum
            status?: string;
        };
        response: {
            /** ID */
            id: ApiKey;
            /** Start Time */
            start_time: number;
            /** Running status */
            status: string;
        };
    };

    /** Get workflow log detail */
    getLogDetail: {
        request: {
            id: ApiKey;
        };
        response: {
            /** Node ID */
            node_id: ApiKey;
            /** Node Name */
            node_name: string;
            /** Running status */
            status: string;
            /** Cost Time */
            cost: number;
            // TODO
            input: Record<string, any>;
            // TODO
            output: Record<string, any>;
        }[];
    };

    /** Get workflow Design */
    getFlowDesign: {
        request: {
            id: ApiKey;
        };
        response: {
            /** ID */
            id: ApiKey;
            /** Name */
            name: string;
            /** Remark */
            remark?: string;
            /** Created At */
            created_at: number;
            /** Updated At */
            updated_at: number;
            /** Enabled */
            enabled: boolean;
            /** User Email */
            user_email: string;
            /** Workflow DSL */
            dsl?: string;
        };
    };

    /** Check workflow Design */
    checkFlowDesign: {
        request: {
            dsl: string;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Save workflow Design */
    saveFlowDesign: {
        request: {
            id: ApiKey;
            dsl: string;
        };
        response: {
            /** ID */
            id: ApiKey;
        };
    };

    /** Run workflow */
    runFlow: {
        request: {
            id: ApiKey;
        };
        response: {
            // TODO: use workflow log status enum
            status: string;
            trace_infos: {
                node_id: ApiKey;
                node_name: string;
                status: string;
                const: number;
                input: Record<string, any>;
                output: Record<string, any>;
            }[];
        };
    };

    /** Run single node */
    runSingleNode: {
        request: {
            node_config: Record<string, any>;
            input: Record<string, any>;
        };
        response: {
            node_id: ApiKey;
            node_name: string;
            status: string;
            const: number;
            input: Record<string, any>;
            output: Record<string, any>;
        };
    };

    /** Get workflow nodes info */
    getFlowNodes: {
        request: void;
        response: Record<
            WorkflowNodeCategoryType,
            {
                componentId: string;
                componentName: string;
            }[]
        >;
    };

    /** Get node form schema */
    getNodeForm: {
        request: {
            id: ApiKey;
        };
        response: unknown;
    };
}

/**
 * Workflow API Service
 */
export default attachAPI<WorkflowAPISchema>(client, {
    apis: {
        getList: `POST ${API_PREFIX}/workflow/flows/search`,
        addFlow: `POST ${API_PREFIX}/workflow/flows`,
        updateFlow: `PUT ${API_PREFIX}/workflow/flows/:id`,
        deleteFlow: `DELETE ${API_PREFIX}/workflow/flows/:id`,
        importFlow: `POST ${API_PREFIX}/workflow/flows/import`,
        exportFlow: `GET ${API_PREFIX}/workflow/flows/:id/export`,
        enableFlow: `GET ${API_PREFIX}/workflow/flows/:id/:status`,
        getLogList: `POST ${API_PREFIX}/workflow/flows/:id/logs/search`,
        getLogDetail: `GET ${API_PREFIX}/workflow/flows/logs/:id`,
        getFlowDesign: `GET ${API_PREFIX}/workflow/flows/:id/design`,
        checkFlowDesign: `POST ${API_PREFIX}/workflow/flows/:id/design/validate`,
        saveFlowDesign: `POST ${API_PREFIX}/workflow/flows/:id/design`,
        runFlow: `POST ${API_PREFIX}/workflow/flows/:id/test`,
        runSingleNode: `POST ${API_PREFIX}/workflow/flows/node/test`,
        getFlowNodes: `GET ${API_PREFIX}/workflow/components`,
        getNodeForm: `GET ${API_PREFIX}/workflow/components/:id`,
    },
});
