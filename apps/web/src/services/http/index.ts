export { isRequestSuccess, getResponseData, awaitWrap, pLimit, API_PREFIX } from './client';

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
export {
    default as credentialsApi,
    type CredentialsAdditionalData,
    type CredentialEncryption,
    type CredentialType,
    type CredentialAPISchema,
} from './credentials';
export { default as camthinkApi, type CamthinkAPISchema, type InferStatus } from './camthink';
export {
    default as mqttApi,
    type TemplateType,
    type TemplateDetailType,
    type TemplateProperty,
    type EntitySchemaType,
    type MqttBrokerInfoType,
    type DataReportResult,
} from './mqtt';
