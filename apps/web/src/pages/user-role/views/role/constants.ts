import { PERMISSIONS } from '@/constants';

export enum MODAL_TYPE {
    ADD = 'add',
    EDIT = 'edit',
}

export enum ROLE_MAIN_TABS {
    MEMBERS = 'members',
    FUNCTIONS = 'functions',
    RESOURCES = 'resources',
}

export enum ROLE_RESOURCES_TABS {
    INTEGRATION = 'integration',
    DEVICE = 'device',
    DASHBOARD = 'dashboard',
}

/**
 * Functions intl text data sign
 */
export const PERMISSION_INTL_SIGN = 'user.role.permission_';

/**
 * Permission intl text key map object
 */
export const permissionMapIntlTextKey: Record<string, string> = {
    add: 'common.label.add',
    edit: 'common.button.edit',
    delete: 'common.label.delete',
    export: 'common.label.export',
    [PERMISSIONS.DASHBOARD_MODULE]: 'common.label.dashboard',
    [PERMISSIONS.DEVICE_MODULE]: 'common.label.device',
    [PERMISSIONS.WORKFLOW_MODULE]: 'common.label.workflow',
    [PERMISSIONS.INTEGRATION_MODULE]: 'common.label.integration',
    [PERMISSIONS.ENTITY_MODULE]: 'common.label.entity',
    [PERMISSIONS.ENTITY_CUSTOM_MODULE]: 'entity.label.custom_entity',
    [PERMISSIONS.ENTITY_DATA_MODULE]: 'device.detail.entity_data',
    [PERMISSIONS.TAG_MODULE]: 'tag.title.tag_management',
    [PERMISSIONS.SETTING_MODULE]: 'common.label.setting',
    [PERMISSIONS.CREDENTIAL_MODULE]: 'setting.integration.label.credential',
};
