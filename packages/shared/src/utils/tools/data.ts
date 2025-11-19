/**
 * Data processing utilities
 */
import { stringify } from 'qs';
import { PRIVATE_PROPERTY_PREFIX } from '../../config';

/**
 * Generate a complete API address
 * @param origin Origin
 * @param path path
 * @param params params
 */
export const genApiUrl = (origin = '', path = '', params?: Record<string, any>) => {
    origin = origin.replace(/\/$/, '');
    path = path.replace(/^\//, '');

    if (params) {
        const connector = path.includes('?') ? '&' : '?';
        path += `${connector}${stringify(params, { arrayFormat: 'repeat' })}`;
    }

    return `${origin}/${path}`;
};

/**
 * Check if a key is a frontend private property
 */
export const checkPrivateProperty = (key?: string) => {
    if (!key) return false;
    const regx = new RegExp(`^\\${PRIVATE_PROPERTY_PREFIX}`);

    return regx.test(key);
};

/**
 * Safely parses a JSON string and returns the parsed value or a default
 * @param str JSON string to parse
 * @param defaultValue Fallback value when parsing fails (optional)
 * @returns Parsed object or defaultValue/undefined when failed
 */
export const safeJsonParse = <T>(str?: string, defaultValue?: T): T | undefined => {
    if (!str) return defaultValue;

    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
};
