/**
 * Common tool functions
 *
 * This file serves as a unified export entry point for all utility functions.
 * All implementations have been categorized and moved to separate files for better maintainability.
 */

// Network utilities
export { isLocalIP } from './network';

// Resource loading utilities
export { loadScript, loadScriptCode, loadStylesheet } from './resource-loader';

// String manipulation utilities
export {
    truncate,
    composeName,
    convertKeysToCamelCase,
    toCamelCase,
    objectToCamelCase,
    camelToSnake,
    objectToCamelToSnake,
    type NameInfo,
} from './string';

// Object manipulation utilities
export { getObjectType, flattenObject } from './object';

// File utilities
export { linkDownload, xhrDownload, isFileName } from './file';

// Random generation utilities
export { generateUUID, genRandomString } from './random';

// Number formatting utilities
export { thousandSeparate, getSizeString, formatPrecision } from './number';

// Asynchronous utilities
export { delay, withPromiseResolvers } from './async';

// Data processing utilities
export { genApiUrl, checkPrivateProperty, safeJsonParse } from './data';

// Formatting utilities
export { compareVersions, hexToRgba, t } from './format';

// Browser API utilities
export { imageCompress, getGeoLocation } from './browser';
