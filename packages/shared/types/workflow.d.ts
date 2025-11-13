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
 * Built in Node Type
 * @param trigger Trigger Node
 * @param timer Timer Node
 * @param listener Listener Node
 * @param mqtt Mqtt Node
 * @param ifelse IfElse Node
 * @param code Code Node
 * @param service Service Node
 * @param assigner Assigner Node
 * @param select Select Node
 * @param email Email Node
 * @param webhook Webhook Node
 * @param output Output Node
 * @param http Http Node
 * @param http Http in Node
 */
declare type WorkflowNodeType =
    | 'trigger'
    | 'timer'
    | 'listener'
    | 'mqtt'
    | 'ifelse'
    | 'code'
    | 'service'
    | 'assigner'
    | 'select'
    | 'email'
    | 'webhook'
    | 'output'
    | 'http'
    | 'httpin';

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
        required?: boolean;
    }[];
}>;

declare type TimePeriodType =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'
    | 'WEEKDAY'
    | 'WEEKEND'
    | 'EVERYDAY';

declare type TimerIntervalType = 'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS';

/**
 * Timer Node Parameters
 */
declare type TimerNodeDataType = BaseNodeDataType<{
    timerSettings: {
        /**
         * Execution Type
         * @param ONCE Single execution
         * @param SCHEDULE Periodic execution
         * @param INTERVAL Interval execution
         */
        type: 'ONCE' | 'SCHEDULE' | 'INTERVAL';
        timezone: string;
        /** Execution Time (Unit s) */
        executionEpochSecond?: number;
        intervalTimeUnit?: TimerIntervalType;
        intervalTime?: number | string;
        rules?: {
            hour?: number;
            minute?: number;
            daysOfWeek?: TimePeriodType[];
        }[];
        /** Expiration Time (Unit s) */
        expirationEpochSecond?: number;
    };
}>;

/**
 * Event Listener Node Parameters
 */
declare type ListenerNodeDataType = BaseNodeDataType<{
    entities: ApiKey[];
    entityData?: {
        keys?: ApiKey[];
        tags?: ApiKey[];
    };
}>;

/**
 * MQTT Node Parameters
 */
declare type MqttNodeDataType = BaseNodeDataType<{
    topic: string;
}>;

/**
 * Http Listening Node Parameters
 */
declare type HttpinNodeDataType = BaseNodeDataType<{
    /** URL */
    url: string;
    /** HTTP Method */
    method: HttpMethodType;
}>;

/**
 * IfElse Node Logic Operator
 */
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
 * @param GT greater than
 * @param GE greater than or equal
 * @param LT less than
 * @param LE less than or equal
 */
declare type WorkflowFilterOperator =
    | 'CONTAINS'
    | 'NOT_CONTAINS'
    | 'START_WITH'
    | 'END_WITH'
    | 'EQ'
    | 'NE'
    | 'IS_EMPTY'
    | 'IS_NOT_EMPTY'
    | 'GT'
    | 'GE'
    | 'LT'
    | 'LE';

/**
 * IfElse Node Parameters
 */
declare type IfElseNodeDataType = BaseNodeDataType<{
    choice: {
        when: {
            id: ApiKey;
            logicOperator: WorkflowLogicOperator;
            /**
             * Expression Type (Default `condition`)
             * @param mvel MVEL Expression
             * @param condition Conditional Expression
             * @param {string} Custom Language
             */
            expressionType: 'mvel' | 'condition' | string;
            conditions: {
                id: ApiKey;
                expressionValue?:
                    | string
                    | {
                          key?: ApiKey;
                          operator?: WorkflowFilterOperator;
                          value?: string | boolean;
                      };
                /** Remark */
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
    payload: {
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
        serviceParams?: Record<string, string | boolean>;
    };
    /** Output */
    payload: {
        name: ApiKey;
        type: EntityValueDataType;
    }[];
}>;

/**
 * Entity Assigner Node Parameters
 */
declare type AssignerNodeDataType = BaseNodeDataType<{
    exchangePayload: Record<ApiKey, string | boolean>;
}>;

/**
 * Entity Selector Node Parameters
 */
declare type SelectNodeDataType = BaseNodeDataType<{
    entities: ApiKey[];
    entityData?: NonNullable<ListenerNodeDataType['parameters']>['entityData'];
}>;

/**
 * Email Node Parameters
 */
declare type EmailNodeDataType = BaseNodeDataType<{
    emailConfig: {
        useSystemSettings?: boolean;
        provider?: 'SMTP' | 'google';
        smtpConfig?: {
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

declare type HttpBodyContentType =
    | 'text/plain'
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded';

/**
 * Http Node Parameters
 */
declare type HttpNodeDataType = BaseNodeDataType<{
    /** HTTP Method */
    method: HttpMethodType;
    /** URL */
    url: string;
    /** Headers */
    header: Record<ApiKey, string>;
    /** Query Parameters */
    params: Record<ApiKey, string>;
    /** Body */
    body: {
        /** Content Type */
        type: '' | HttpBodyContentType;
        /** Body Content */
        value: string | Record<ApiKey, string>;
    };
}>;

/**
 * Output Node Parameters
 */
declare type OutputNodeDataType = BaseNodeDataType<{
    /** Outputs */
    outputVariables: Record<ApiKey, string>;
}>;

/**
 * Workflow Node Data Map
 */
type NodeTypeMap = {
    trigger: TriggerNodeDataType;
    timer: TimerNodeDataType;
    listener: ListenerNodeDataType;
    mqtt: MqttNodeDataType;
    httpin: HttpinNodeDataType;
    ifelse: IfElseNodeDataType;
    code: CodeNodeDataType;
    service: ServiceNodeDataType;
    assigner: AssignerNodeDataType;
    select: SelectNodeDataType;
    email: EmailNodeDataType;
    webhook: WebhookNodeDataType;
    http: HttpNodeDataType;
    output: OutputNodeDataType;
};

/**
 * Workflow Node Model
 */
declare type WorkflowNode<T extends WorkflowNodeType | undefined = undefined> =
    T extends keyof NodeTypeMap
        ? ReactFlowNode<Partial<NodeTypeMap[T]>, T>
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
    /** Version */
    version: string;
    /** Name */
    name: string;
    /** Description */
    remark?: string;
    /** Nodes */
    nodes: WorkflowNode[];
    /** Edges */
    edges: WorkflowEdge[];
    /** Viewport */
    viewport: ReactFlowViewport;
};
