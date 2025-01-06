/**
 * ReactFlow Node Model
 */
declare type ReactFlowNode<
    D extends Record<string, unknown> = Record<string, unknown>,
    T extends string = string,
> = import('@xyflow/react').Node<D, T> & {
    /** Backend Node Type */
    componentName: string;
};

/**
 * ReactFlow Edge Model
 */
declare type ReactFlowEdge<
    D extends Record<string, unknown> = Record<string, unknown>,
    T extends string = string,
> = import('@xyflow/react').Edge<D, T>;

/**
 * ReactFlow Viewport Model
 */
declare type ReactFlowViewport = import('@xyflow/react').Viewport;

/**
 * Node Type
 * @param trigger Trigger Node
 * @param timer Timer Node
 * @param listener Listener Node
 * @param ifelse IfElse Node
 * @param code Code Node
 * @param service Service Node
 * @param assigner Assigner Node
 * @param select Select Node
 * @param email Email Node
 * @param webhook Webhook Node
 */
declare type WorkflowNodeType =
    | 'trigger'
    | 'timer'
    | 'listener'
    | 'ifelse'
    | 'code'
    | 'service'
    | 'assigner'
    | 'select'
    | 'email'
    | 'webhook';

/**
 * Edge Type
 * @param addable Edges to which nodes can be added
 */
declare type WorkflowEdgeType = 'addable';

/**
 * Node Category
 * @param entry Entry Node
 * @param control Control Node
 * @param action Action Node
 * @param external External Node
 */
declare type WorkflowNodeCategoryType = 'entry' | 'control' | 'action' | 'external';

/**
 * Node Status Type
 */
declare type WorkflowNodeStatus = 'ERROR' | 'SUCCESS';

/**
 * Node Param Value Type
 */
declare type WorkflowParamValueType = 'INT' | 'FLOAT' | 'BOOLEAN' | 'STRING';

/**
 * Node Base Data Model（Properties that begin with `$` are private to the frontend）
 */
declare type BaseNodeDataType<T extends Record<string, any> = Record<string, any>> = {
    /** Node Name */
    nodeName: string;
    /** Node Remark */
    nodeRemark?: string;
    /** Status */
    $status?: WorkflowNodeStatus;
    /** Error Message */
    $errMsg?: React.ReactNode;
    /** Flow Parameters */
    parameters?: T;
};

/**
 * Trigger Node Parameters
 */
declare type TriggerNodeDataType = BaseNodeDataType<{
    /** Entity Definition */
    entityConfigs: {
        identify: string;
        name: string;
        type: EntityValueDataType;
    }[];
}>;

declare type TimePeriodType =
    | 'EVERYDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

/**
 * Timer Node Parameters
 */
declare type TimerNodeDataType = BaseNodeDataType<{
    timerSettings: {
        type: 'ONCE' | 'SCHEDULE';
        timezone: string;
        executionEpochSecond?: number;
        rules?: {
            hour?: number;
            minute?: number;
            daysOfWeek?: TimePeriodType[];
        }[];
        expirationEpochSecond?: number;
    };
}>;

/**
 * Event Listener Node Parameters
 */
declare type ListenerNodeDataType = BaseNodeDataType<{
    entities: ApiKey[];
}>;

declare type WorkflowLogicOperator = 'AND' | 'OR';

/**
 * Filter Operator used in the Condition Expression
 * @param CONTAINS contains
 * @param NOT_CONTAINS not contains
 * @param START_WITH start witch
 * @param END_WITH end witch
 * @param EQ equal
 * @param NE not equal
 * @param IS_EMPTY is empty
 * @param IS_NOT_EMPTY is not empty
 */
declare type WorkflowFilterOperator =
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'START_WITH'
    | 'END_WITH'
    | 'EQ'
    | 'NE'
    | 'IS_EMPTY'
    | 'IS_NOT_EMPTY';

/**
 * IfElse Node Parameters
 */
declare type IfElseNodeDataType = BaseNodeDataType<{
    choice: {
        when: {
            id: ApiKey;
            logicOperator: WorkflowLogicOperator;
            /**
             * 表达式类型（默认 `condition`）
             * @param mvel mvel 表达式
             * @param condition 条件表达式
             */
            expressionType: 'mvel' | 'condition';
            conditions: {
                id: ApiKey;
                expressionValue?:
                    | string
                    | {
                          key?: ApiKey;
                          operator?: WorkflowFilterOperator;
                          value?: string;
                      };
                /** 表达式备注 */
                expressionDescription?: string;
            }[];
        }[];
        otherwise: {
            id: ApiKey;
        };
    };
}>;

/**
 * End Node Parameters
 */
// declare type EndNodeDataType = BaseNodeDataType<{
//     /** Outputs */
//     outputs: {
//         key: ApiKey;
//         type: EntityValueDataType;
//         value: any;
//     }[];
// }>;

/**
 * Code Node Parameters
 */
declare type CodeNodeDataType = BaseNodeDataType<{
    /** Code Content */
    expression: {
        language: string;
        expression: string;
    };
    /** Input Arguments */
    inputArguments: Record<ApiKey, string>;
    /** Output */
    Payload: {
        name: ApiKey;
        type: EntityValueDataType;
    }[];
}>;

/**
 * Service Node Parameters
 */
declare type ServiceNodeDataType = BaseNodeDataType<{
    serviceInvocationSetting: {
        /** Service Entity Key */
        serviceEntity: string;
        /** Input variables of service entity */
        serviceParams?: Record<string, string>;
    };
}>;

/**
 * Entity Assigner Node Parameters
 */
declare type AssignerNodeDataType = BaseNodeDataType<{
    exchangePayload: Record<ApiKey, string>;
}>;

/**
 * Entity Selector Node Parameters
 */
declare type SelectNodeDataType = BaseNodeDataType<{
    entities: ApiKey[];
}>;

/**
 * Email Node Parameters
 */
declare type EmailNodeDataType = BaseNodeDataType<{
    emailConfig: {
        provider: 'SMTP' | 'google';
        smtpConfig: {
            host: string;
            port: number;
            encryption: 'STARTTLS' | 'NONE';
            username: string;
            password: string;
        };
    };
    subject: string;
    recipients: string[];
    content: string;
}>;

/**
 * Webhook Node Parameters
 */
declare type WebhookNodeDataType = BaseNodeDataType<{
    /** Custom Data */
    inputArguments?: Record<ApiKey, string>;
    /** Webhook URL */
    webhookUrl: string;
    /** Webhook Secret */
    secretKey?: string;
}>;

/**
 * Workflow Node Model
 */
declare type WorkflowNode<T extends WorkflowNodeType | undefined = undefined> = T extends 'trigger'
    ? ReactFlowNode<Partial<TriggerNodeDataType>, 'trigger'>
    : T extends 'timer'
      ? ReactFlowNode<Partial<TimerNodeDataType>, 'timer'>
      : T extends 'listener'
        ? ReactFlowNode<Partial<ListenerNodeDataType>, 'listener'>
        : T extends 'ifelse'
          ? ReactFlowNode<Partial<IfElseNodeDataType>, 'ifelse'>
          : T extends 'code'
            ? ReactFlowNode<Partial<CodeNodeDataType>, 'code'>
            : T extends 'service'
              ? ReactFlowNode<Partial<ServiceNodeDataType>, 'service'>
              : T extends 'assigner'
                ? ReactFlowNode<Partial<AssignerNodeDataType>, 'assigner'>
                : T extends 'select'
                  ? ReactFlowNode<Partial<SelectNodeDataType>, 'select'>
                  : T extends 'email'
                    ? ReactFlowNode<Partial<EmailNodeDataType>, 'email'>
                    : T extends 'webhook'
                      ? ReactFlowNode<Partial<WebhookNodeDataType>, 'webhook'>
                      : ReactFlowNode<Partial<BaseNodeDataType>, WorkflowNodeType>;

/**
 * Workflow Edge Model
 */
declare type WorkflowEdge = ReactFlowEdge<
    {
        /** mouse hover mark */
        $hovering?: boolean;
    },
    WorkflowEdgeType
>;

/**
 * Workflow Schema
 */
declare type WorkflowSchema = {
    /** 版本号 */
    version: string;
    /** 名称 */
    name: string;
    /** 描述 */
    remark?: string;
    /** 节点 */
    nodes: WorkflowNode[];
    /** 边 */
    edges: WorkflowEdge[];
    /** 视口 */
    viewport: ReactFlowViewport;
};
