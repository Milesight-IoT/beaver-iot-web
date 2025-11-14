/**
 * Permissions configuration code
 */
export enum PERMISSIONS {
    /**
     * Dashboard module
     */
    DASHBOARD_MODULE = 'dashboard',
    DASHBOARD_VIEW = 'dashboard.view',
    DASHBOARD_ADD = 'dashboard.add',
    DASHBOARD_EDIT = 'dashboard.edit',
    DASHBOARD_DELETE = 'dashboard.delete',

    /**
     * Device module
     */
    DEVICE_MODULE = 'device',
    DEVICE_VIEW = 'device.view',
    DEVICE_ADD = 'device.add',
    DEVICE_EDIT = 'device.edit',
    DEVICE_DELETE = 'device.delete',
    DEVICE_GROUP_MANAGE = 'device.group_manage',

    /**
     * Entity module
     * Custom entity module
     */
    ENTITY_MODULE = 'entity',
    ENTITY_CUSTOM_MODULE = 'entity_custom',
    ENTITY_CUSTOM_VIEW = 'entity_custom.view',
    ENTITY_CUSTOM_ADD = 'entity_custom.add',
    ENTITY_CUSTOM_EDIT = 'entity_custom.edit',
    ENTITY_CUSTOM_DELETE = 'entity_custom.delete',
    /**
     * Entity data module
     */
    ENTITY_DATA_MODULE = 'entity_data',
    ENTITY_DATA_VIEW = 'entity_data.view',
    ENTITY_DATA_EDIT = 'entity_data.edit',
    // ENTITY_DATA_EXPORT = 'entity_data.export',

    /**
     * User role module
     */
    USER_ROLE_MODULE = 'user_role',

    /**
     * Workflow module
     */
    WORKFLOW_MODULE = 'workflow',
    WORKFLOW_VIEW = 'workflow.view',
    WORKFLOW_ADD = 'workflow.add',
    WORKFLOW_EDIT = 'workflow.edit',
    WORKFLOW_DELETE = 'workflow.delete',

    /**
     * Integration module
     */
    INTEGRATION_MODULE = 'integration',
    INTEGRATION_VIEW = 'integration.view',

    /**
     * Setting module
     * Credentials module
     */
    SETTING_MODULE = 'settings',
    CREDENTIAL_MODULE = 'credentials',
    CREDENTIAL_MODULE_VIEW = 'credentials.view',
    CREDENTIAL_MODULE_EDIT = 'credentials.edit',

    /**
     * Tag module
     */
    TAG_MODULE = 'tag',
    TAG_MODULE_VIEW = 'entity_tag.view',
    TAG_MODULE_MANAGE = 'entity_tag.manage',
}

// Entity Pattern
export enum ENTITY_ACCESS_MODE {
    R = 'R',
    RW = 'RW',
    W = 'W',
}

// Entity Type
export enum ENTITY_TYPE {
    PROPERTY = 'PROPERTY',
    SERVICE = 'SERVICE',
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

/**
 * Device status entity unique identifier
 */
export const DEVICE_STATUS_ENTITY_UNIQUE_ID = '@status';
/**
 * Device latitude entity unique identifier
 */
export const DEVICE_LATITUDE_ENTITY_UNIQUE_ID = '@location.@latitude';
/**
 * Device longitude entity unique identifier
 */
export const DEVICE_LONGITUDE_ENTITY_UNIQUE_ID = '@location.@longitude';
/**
 * Device alarm status entity unique identifier
 */
export const DEVICE_ALARM_STATUS_ENTITY_UNIQUE_ID = '@alarm.@alarm_status';
/**
 * Device alarm time entity unique identifier
 */
export const DEVICE_ALARM_TIME_ENTITY_UNIQUE_ID = '@alarm.@alarm_time';
/**
 * Device alarm content entity unique identifier
 */
export const DEVICE_ALARM_CONTENT_ENTITY_UNIQUE_ID = '@alarm.@alarm_content';
