export { isRequestSuccess, getResponseData, awaitWrap, pLimit, API_PREFIX } from './client';

export {
    default as deviceAPI,
    type DeviceDetail,
    type DeviceAPISchema,
    type DeviceGroupItemProps,
    type AddDeviceProps,
    type ImportEntityProps,
    type DeviceStatus,
    type LocationType,
    type DeviceAlarmDetail,
    type AlarmSearchCondition,
} from './device';

export { default as entityAPI, type EntityAPISchema } from './entity';
export { default as integrationAPI, type IntegrationAPISchema } from './integration';
export { default as globalAPI, type GlobalAPISchema } from './global';
export {
    default as dashboardAPI,
    type DashboardAPISchema,
    type DashboardDetail,
    type WidgetDetail,
    type DashboardListProps,
    type DashboardCoverType,
    type DrawingBoardDetail,
    type AttachType,
} from './dashboard';
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

export {
    default as embeddedNSApi,
    type SyncedDeviceType,
    type SyncAbleDeviceType,
    type DeviceModelItem,
    type GatewayDetailType,
} from './embedded-ns';
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
    DEFAULT_DEVICE_OFFLINE_TIMEOUT,
    type TemplateType,
    type TemplateDetailType,
    type TemplateProperty,
    type EntitySchemaType,
    type MqttBrokerInfoType,
    type DataReportResult,
} from './mqtt';
export { default as tagAPI, type TagAPISchema, type TagItemProps, TagOperationEnums } from './tag';
export { default as blueprintAPI, BlueprintSourceType, type BlueprintAPISchema } from './blueprint';
