export { isRequestSuccess, getResponseData, awaitWrap, API_PREFIX } from './client';

export { default as deviceAPI, type DeviceDetail, type DeviceAPISchema } from './device';
export { default as parserAPI, type ParserDetail, type ParserAPISchema } from './parser';
export { default as productAPI, type ProductDetail, type ProductAPISchema } from './product';
export { default as pluginAPI, type PluginDetail, type PluginAPISchema } from './plugin';


export { default as entityAPI, type EntityAPISchema } from './entity';
export { default as integrationAPI, type IntegrationAPISchema } from './integration';
export { default as globalAPI, type GlobalAPISchema } from './global';
export { default as dashboardAPI, type DashboardAPISchema } from './dashboard';
