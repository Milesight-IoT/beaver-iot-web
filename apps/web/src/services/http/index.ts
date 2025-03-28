export { isRequestSuccess, getResponseData, awaitWrap, API_PREFIX } from './client';

export { default as deviceAPI, type DeviceDetail, type DeviceAPISchema } from './device';

export { default as entityAPI, type EntityAPISchema } from './entity';
export { default as integrationAPI, type IntegrationAPISchema } from './integration';
export { default as globalAPI, type GlobalAPISchema } from './global';
export { default as dashboardAPI, type DashboardAPISchema } from './dashboard';
export {
    default as workflowAPI,
    type FlowStatus,
    type WorkflowAPISchema,
    type FlowNodeTraceInfo,
} from './workflow';
export {
    default as userAPI,
    type UserAPISchema,
    type RoleType,
    type UserMenuType,
    type UserType,
    type RoleResourceType,
} from './user';

export { default as embeddedNSApi, type GatewayDetailType } from './embedded-ns';
