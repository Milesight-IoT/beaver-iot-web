import { type NodeConfigItemType } from '../../config';

/**
 * Workflow Design Mode
 */
export type DesignMode = 'canvas' | 'advanced';

/**
 * Workflow Move Mode
 * @template pointer - Pointer mode
 * @template hand - Hand mode
 */
export type MoveMode = 'pointer' | 'hand';

export type NodeFormItemValueType =
    | 'string'
    | 'int'
    | 'boolean'
    | 'enum'
    | 'array'
    | 'map'
    | 'duration'
    | 'object';

export type NodeFormItemConfig = {
    name: string;
    type: NodeFormItemValueType;
    kind: 'path' | 'parameter';
    multiValue: boolean;
    displayName: string;
    defaultValue: string;
    initialValue?: string;
    description: string;
    index: number;
    enum?: string[] | Record<string, string>;
    required?: boolean;
    secret?: boolean;
    autowired?: boolean;
    editable?: boolean;
    uiComponent?: string;
    // uiComponentTags: string;
    uiComponentGroup?: string;
};

/**
 * The backend node schema
 */
export type NodeConfigSchema = {
    component: {
        /** Unique ID */
        name: string;
        /** Title */
        title: string;
        /** Category */
        type: string;
        /* Description */
        description: string;
        /** Testable */
        testable?: boolean;
    };
    properties: Record<string, NodeFormItemConfig>;
    outputProperties: Record<string, NodeFormItemConfig>;
};

export type NodeConfigItem = NodeConfigItemType & {
    label?: string;
    /** The backend node schema */
    schema?: NodeConfigSchema;
};

/**
 * The custom entity value type in workflow
 */
export type CustomEntityValueType =
    | Extract<EntityValueDataType, 'LONG' | 'DOUBLE' | 'BOOLEAN' | 'STRING'>
    | 'OTHER';

export type NodeParamType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    nodeLabel?: string;
    outputs: {
        name: string;
        type?: EntityValueDataType;
        typeLabel?: string;
        key: string;
        originKey: string;
        enums?: {
            key: string;
            label?: string;
        }[];
    }[];
};

export type FlattenNodeParamType = {
    nodeId: ApiKey;
    nodeName?: string;
    nodeType?: WorkflowNodeType;
    valueName: string;
    valueType?: EntityValueDataType;
    valueTypeLabel?: string;
    valueKey: string;
    valueOriginKey: string;
    enums?: {
        key: string;
        label?: string;
    }[];
};

/**
 * Node Data Validator
 */
export type NodeDataValidator<T = any> = (
    value?: T,
    fieldName?: string,
    options?: {
        node?: WorkflowNode;
        nodeConfig?: NodeConfigItem;
        upstreamParams?: FlattenNodeParamType[];
        /** entity assignment use entity list */
        entityList?: ObjectToCamelCase<EntityData[]> | undefined;
    },
) => string | boolean | undefined;
