/**
 * String manipulation utilities
 */
import { camelCase, isPlainObject } from 'lodash-es';

interface TruncateOptions {
    /** Maximum Length */
    maxLength: number;
    /** Ellipsis placeholder, the default is '...' */
    ellipsis?: string;
    /** Ellipsis position，default is 'end' */
    ellipsisPosition?: 'start' | 'middle' | 'end';
}
/**
 * Trim the string to the specified length and add a placeholder
 * @param {String} str String that needs to be cut off
 * @param {Options} options Trim option
 * @returns {String}
 */
export const truncate = (str: string, options: TruncateOptions): string => {
    const { maxLength, ellipsis = '...', ellipsisPosition = 'end' } = options;

    if (typeof str !== 'string') {
        throw new TypeError('The parameter must be a string type');
    }

    // eslint-disable-next-line
    const regExp = /([\u4e00-\u9fa5])|([^\x00-\xff])/g; // Matching Chinese and non -ASCII characters
    let count = 0;
    let truncatedLength = 0;

    for (let i = 0, len = str.length; i < len; i++) {
        if (count >= maxLength) {
            break;
        }
        const char = str[i];
        const isChinese = !!char.match(regExp);
        count += isChinese ? 2 : 1;
        truncatedLength++;

        /**
         * Traversing to the last character, if the number of characters is less than the
         * maximum limit number of characters at this time, or the cutting length is equal to
         * the character length, then return to the original character directly.
         */
        if (i === len - 1 && (count <= maxLength || len === truncatedLength)) {
            return str;
        }
    }

    const truncatedStr = str.substring(0, truncatedLength);

    switch (ellipsisPosition) {
        case 'start': {
            return ellipsis + truncatedStr.slice(ellipsis.length);
        }
        case 'middle': {
            // Calculate the length of the left and right parts
            const leftHalfMaxLength = Math.floor((maxLength - ellipsis.length) / 2);
            const rightHalfMaxLength = maxLength - ellipsis.length - leftHalfMaxLength;
            // Truncate the left characters
            const leftHalf = truncatedStr.slice(0, leftHalfMaxLength);
            let rightHalf = '';
            let count = 0;

            // Truncate the right characters
            for (let i = str.length - 1; i >= 0; i--) {
                if (count >= rightHalfMaxLength) {
                    break;
                }
                const char = str[i];
                const isChinese = !!char.match(regExp);
                count += isChinese ? 2 : 1;
                rightHalf = `${char}${rightHalf}`;
            }

            // Stitching string
            return leftHalf + ellipsis + rightHalf;
        }
        case 'end': {
            return truncatedStr + ellipsis;
        }
        default: {
            throw new Error(`Invalid placeholder location "${ellipsisPosition}"`);
        }
    }
};

export interface NameInfo {
    firstName?: string;
    lastName?: string;
}
/**
 * Combination name
 * @param {NameInfo} nameInfo - Name objects containing `firstName` and `lastName`
 * @param {boolean} isCN - Whether it is the Chinese environment
 * @returns {string}
 */
export const composeName = (nameInfo: NameInfo, isCN = true): string => {
    const firstName = nameInfo?.firstName || '';
    const lastName = nameInfo?.lastName || '';

    if (isCN) return lastName + firstName;
    return firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName;
};

/**
 * Convert snake case to camel case
 * @deprecated
 */
export const convertKeysToCamelCase = <T extends Record<string, any>>(target: T) => {
    if (!target || !isPlainObject(target)) {
        throw new Error('convertKeysToCamelCase: target must be an object');
    }

    const camelCaseObj: Record<string, any> = {};

    // eslint-disable-next-line guard-for-in
    for (const key in target) {
        const value = target[key];
        const camelCaseKey = camelCase(key);

        if (Array.isArray(value)) {
            camelCaseObj[camelCaseKey] = value.map((item: any) => convertKeysToCamelCase(item));
        } else if (isPlainObject(value)) {
            camelCaseObj[camelCaseKey] = convertKeysToCamelCase(value);
        } else {
            camelCaseObj[camelCaseKey] = value;
        }
    }

    return camelCaseObj as ConvertKeysToCamelCase<T>;
};

/**
 * Convert all the attribute names of the object to the specified naming method
 * @param obj Object to be converted
 * @param keyConverter Function of converting attribute name
 * @returns new object that has be converted
 */
function convertObjectCase<TInput extends object, TResult extends ObjectToCamelCase<TInput>>(
    obj: TInput,
    keyConverter: (arg: string) => string,
): TResult {
    if (obj === null || typeof obj === 'undefined' || typeof obj !== 'object') {
        return obj;
    }

    const out = (Array.isArray(obj) ? [] : {}) as TResult;
    for (const [k, v] of Object.entries(obj)) {
        // @ts-ignore
        out[keyConverter(k)] = Array.isArray(v)
            ? (v.map(<ArrayItem extends object>(item: ArrayItem) =>
                  typeof item === 'object' &&
                  !(item instanceof Uint8Array) &&
                  !(item instanceof Date)
                      ? convertObjectCase<ArrayItem, ObjectToCamelCase<ArrayItem>>(
                            item,
                            keyConverter,
                        )
                      : item,
              ) as unknown[])
            : v instanceof Uint8Array || v instanceof Date
              ? v
              : typeof v === 'object'
                ? convertObjectCase<typeof v, ObjectToCamelCase<typeof v>>(v, keyConverter)
                : (v as unknown);
    }
    return out;
}

/**
 * Convert string to camel case
 * @param str The string to be converted
 * @returns
 */
export function toCamelCase<T extends string>(str: T): ToCamelCase<T> {
    return (
        str.length === 1
            ? str.toLowerCase()
            : str
                  .replace(/^([A-Z])/, m => m[0].toLowerCase())
                  .replace(/[_]([a-z0-9])/g, m => m[1].toUpperCase())
    ) as ToCamelCase<T>;
}

/**
 * Convert all the attribute names of the object to the camel case
 * @param obj The Object to be converted
 * @returns
 */
export function objectToCamelCase<T extends object>(obj: T): ObjectToCamelCase<T> {
    return convertObjectCase(obj, toCamelCase);
}

/**
 * Convert string to snake case
 * @param str The string to be converted
 * @returns
 */
export function camelToSnake<T extends string>(str: T): ToCamelCase<T> {
    return str.replace(/([A-Z])/g, function (match) {
        return `_${match.toLowerCase()}`;
    }) as ToCamelCase<T>;
}

/**
 * Convert all the attribute names of the object to the snake case
 * @param obj The Object to be converted
 * @returns
 */
export function objectToCamelToSnake<T extends object>(obj: T): ObjectToCamelCase<T> {
    return convertObjectCase(obj, camelToSnake);
}
