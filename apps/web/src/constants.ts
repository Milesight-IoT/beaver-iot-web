/**
 * permissions configuration code
 */
export enum PERMISSIONS {
    /**
     * dashboard module
     */
    DASHBOARD_MODULE = 'dashboard',
    DASHBOARD_VIEW = 'dashboard.view',
    DASHBOARD_ADD = 'dashboard.add',
    DASHBOARD_EDIT = 'dashboard.edit',

    /**
     * device module
     */
    DEVICE_MODULE = 'device',
    DEVICE_VIEW = 'device.view',
    DEVICE_ADD = 'device.add',
    DEVICE_EDIT = 'device.edit',
    DEVICE_DELETE = 'device.delete',

    /**
     * entity module
     * custom entity module
     */
    ENTITY_MODULE = 'entity',
    ENTITY_CUSTOM_MODULE = 'entity_custom',
    ENTITY_CUSTOM_VIEW = 'entity_custom.view',
    ENTITY_CUSTOM_ADD = 'entity_custom.add',
    ENTITY_CUSTOM_EDIT = 'entity_custom.edit',
    ENTITY_CUSTOM_DELETE = 'entity_custom.delete',
    /**
     * entity data module
     */
    ENTITY_DATA_MODULE = 'entity_data',
    ENTITY_DATA_VIEW = 'entity_data.view',
    ENTITY_DATA_EDIT = 'entity_data.edit',
    ENTITY_DATA_EXPORT = 'entity_data.export',

    /**
     * user role module
     */
    USER_ROLE_MODULE = 'user_role',

    /**
     * workflow module
     */
    WORKFLOW_MODULE = 'workflow',
    WORKFLOW_VIEW = 'workflow.view',
    WORKFLOW_ADD = 'workflow.add',
    WORKFLOW_EDIT = 'workflow.edit',
    WORKFLOW_DELETE = 'workflow.delete',

    /**
     * integration module
     */
    INTEGRATION_MODULE = 'integration',
    INTEGRATION_VIEW = 'integration.view',

    /**
     * credentials module
     */
    CREDENTIAL_MODULE = 'credentials',
    CREDENTIAL_MODULE_VIEW = 'credentials.view',
    CREDENTIAL_MODULE_EDIT = 'credentials.edit',
}

// Entity Pattern
export enum ENTITY_ACCESS_MODE {
    R = 'R',
    RW = 'RW',
    W = 'W',
}

// Entity Type
export enum ENTITY_TYPE {
    SERVICE = 'SERVICE',
    PROPERTY = 'PROPERTY',
    EVENT = 'EVENT',
}

// Entity Value Type
export enum ENTITY_VALUE_TYPE {
    LONG = 'LONG',
    STRING = 'STRING',
    DOUBLE = 'DOUBLE',
    BOOLEAN = 'BOOLEAN',
}

// Entity Data Value Type
export enum ENTITY_DATA_VALUE_TYPE {
    LONG = 'LONG',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    DOUBLE = 'DOUBLE',
    OBJECT = 'OBJECT',
}

export const entityTypeOptions = [
    {
        label: 'entity.label.entity_type_of_long',
        value: 'LONG',
    },
    {
        label: 'entity.label.entity_type_of_double',
        value: 'DOUBLE',
    },
    {
        label: 'entity.label.entity_type_of_boolean',
        value: 'BOOLEAN',
    },
    {
        label: 'entity.label.entity_type_of_string',
        value: 'STRING',
    },
];
