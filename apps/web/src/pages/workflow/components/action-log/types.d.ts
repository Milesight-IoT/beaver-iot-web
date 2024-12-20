import { type ReactFlowJsonObject } from '@xyflow/react';
import { type WorkflowAPISchema } from '@/services/http';
import type { LogStatus } from '../../config';

/**
 * Action Log Type
 */
export interface AccordionLog {
    /**
     * Node Type
     */
    type: WorkflowNodeType;
    /**
     * Node Name
     */
    name: string;
    /**
     * Custom header render config
     */
    config?: CustomConfigItemType;
    /**
     * Node status
     */
    status: LogStatus;
    /**
     * Node time cost
     */
    timeCost: number;
    /**
     * TODO Input
     */
    input: Record<string, any>;
    /**
     * TODO Output
     */
    output: Record<string, any>;
    /**
     * Children
     */
    children?: AccordionLog[];
}

/**
 * Custom header render config
 */
export type CustomConfigItemType = {
    /**
     * Label i18n key
     */
    labelIntlKey?: string;
    /**
     * Node Icon
     */
    icon?: React.ReactNode;
    /**
     * Node Icon background color
     */
    iconBgColor?: string;
};

/**  Workflow Trace Type */
export type WorkflowTraceType = WorkflowAPISchema['getLogDetail']['response'][number];

/**  Workflow Data Type */
export type WorkflowDataType = ReactFlowJsonObject<WorkflowNode, WorkflowEdge>;
