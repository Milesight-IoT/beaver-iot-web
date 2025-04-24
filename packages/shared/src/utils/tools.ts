/**
 * Common tool functions
 */
import { stringify } from 'qs';
import axios, { type Canceler } from 'axios';
import { camelCase, isPlainObject } from 'lodash-es';
import { PRIVATE_PROPERTY_PREFIX } from '../config';

/**
 * Check whether it is a local IP address
 * @param {String} ip
 * @returns
 */
export const isLocalIP = (ip: string): boolean => {
    // Check whether it is an IPv6 address
    if (ip.includes(':')) {
        return (
            /^fe80::/.test(ip) ||
            /^::1$/.test(ip) ||
            /^fd[0-9a-f]{2}(:[0-9a-f]{4}){3}:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}:[0-9a-f]{4}$/.test(
                ip,
            )
        );
    }

    // Check whether it is an IPv4 address
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
        return false;
    }

    const firstPart = parseInt(ipParts[0]);
    const secondPart = parseInt(ipParts[1]);

    // Check whether it is a private address
    if (firstPart === 10) {
        return true;
    }
    if (firstPart === 172 && secondPart >= 16 && secondPart <= 31) {
        return true;
    }
    if (firstPart === 192 && ipParts[1] === '168') {
        return true;
    }

    // Check whether it is a loopback address
    return ip === '127.0.0.1' || ip === '::1';
};

/**
 * Asynchronous loading JS resource file
 * @param src Resource file path
 * @param attrs Custom Script attribute
 * @param removeOnLoad Whether to remove the script label after loading, the default is false
 * @returns Return a promise, the resolution parameter is the HTMLScriptElement after
 * the loading is completed
 */
export const loadScript = (
    src: string,
    attrs?: Record<string, any>,
    removeOnLoad = false,
): Promise<HTMLScriptElement> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;

        if (attrs) {
            // eslint-disable-next-line
            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    script.setAttribute(key, attrs[key]);
                }
            }
        }

        const handleLoad = (): void => {
            cleanup();
            resolve(script);
        };

        const handleError = (event: ErrorEvent): void => {
            cleanup();
            reject(new Error(`Failed to load script: ${src} (${event.message})`));
        };

        const cleanup = (): void => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            if (removeOnLoad && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        document.head.appendChild(script);
    });
};

/**
 * Dynamically insert JavaScript code to the page
 * @param code JavaScript code to be inserted
 * @returns Insert `<script>` tag objects
 */
export const loadScriptCode = (code: string): HTMLScriptElement => {
    const script = document.createElement('script');

    script.innerHTML = code;
    document.head.appendChild(script);
    return script;
};

type CSSLoadOptions = {
    /** Link attributes */
    attrs?: Record<string, any>;
    /** Whether it is inserted before all head elements. The default `false` */
    insertBefore?: boolean;
};
/**
 * Asynchronous loading style sheet resource file
 * @param url Resource address
 * @param options.attrs
 * @param options.insertBefore
 * @returns Return a promise, the resolve parameter is the HtmlLinkElement after loading
 */
export const loadStylesheet = (
    url: string,
    options: CSSLoadOptions = {},
): Promise<HTMLLinkElement> => {
    const { attrs, insertBefore } = options;

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;

        if (attrs) {
            // eslint-disable-next-line
            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    link.setAttribute(key, attrs[key]);
                }
            }
        }

        const handleLoad = (): void => {
            cleanup();
            resolve(link);
        };

        const handleError = (event: ErrorEvent): void => {
            cleanup();
            reject(new Error(`Failed to load stylesheet: ${url} (${event.message})`));
        };

        const cleanup = (): void => {
            link.removeEventListener('load', handleLoad);
            link.removeEventListener('error', handleError);
        };
        const head = document.head || document.getElementsByTagName('head')[0];

        link.addEventListener('load', handleLoad);
        link.addEventListener('error', handleError);

        if (insertBefore) {
            const { firstChild } = head;
            if (firstChild) {
                head.insertBefore(link, firstChild);
            } else {
                head.appendChild(link);
            }
        } else {
            head.appendChild(link);
        }
    });
};

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

/**
 * The version number comparative function, determine whether the first version number is
 * greater than or equal to the second version number
 * @param {String} version1 The first version number (supports 1.1, 1.2.3, V1.2.3 format)
 * @param {String} version2 The second version number (supports 1.1, 1.2.3, V1.2.3 format)
 */
export const compareVersions = (version1: string, version2: string) => {
    const ver1 = !version1.startsWith('v') ? version1 : version1.substring(1);
    const ver2 = !version2.startsWith('v') ? version2 : version2.substring(1);
    const parts1 = ver1.split('.');
    const parts2 = ver2.split('.');
    const length = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < length; i++) {
        const num1 = parseInt(parts1[i] || '0'); // Converted to integer, default 0
        const num2 = parseInt(parts2[i] || '0');

        if (num1 > num2) {
            return true;
        }
        if (num1 === num2) {
            if (i + 1 === length) return true;
            continue;
        }

        return false;
    }

    return false;
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
 * Download file based `a` tag
 * @param {string | Blob} assets - File address or blob data
 * @param {string} fileName - File name
 *
 * @description
 * ** Advantage: ** Streaming download, reducing the CPU and memory pressure when downloading large files
 *
 * ** Limited conditions: **
 * 1. For cross domain URL downloads, the `fileName` parameter will fail and cannot be renamed. You
 * can use the `xhrDownload` method to download;
 * 2. Edge and other browsers will automatically open the file preview when downloading Office files. You
 *  can use the `xhrDownload` method to download;
 */
export const linkDownload = (assets: string | Blob, fileName: string) => {
    if (!assets) return;

    const fileUrl = assets instanceof Blob ? window.URL.createObjectURL(assets) : assets;

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = fileUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(fileUrl);
    document.body.removeChild(link);
};

interface DownloadOptions {
    /**
     * File address or blob data
     */
    assets: string | Blob;
    /**
     * File name
     */
    fileName: string;
    /**
     * Download progress callback
     * @param percent Download progress percentage
     */
    onProgress?: (percent: number) => void;
    /**
     * Custom request header
     */
    header?: Record<string, string>;
}
interface xhrDownloadResponse<T> {
    /**
     * Interrupt download
     */
    abort: () => void;
    /**
     * Download success callback
     */
    then: Promise<T>['then'];
    /**
     * Download failed callback
     */
    catch: Promise<T>['catch'];
}
/**
 * HTTP-based file download
 * @param {DownloadOptions} options Download options
 * @param {string | Blob} options.assets File address or blob data
 * @param {string} options.fileName fileName
 * @param {Function} [options.onProgress] Download progress callback
 * @return {xhrDownloadResponse} return PromiseLike object
 */
export const xhrDownload = ({
    assets,
    fileName,
    onProgress,
    header,
}: DownloadOptions): xhrDownloadResponse<string> => {
    if (!assets) {
        throw new Error('assets is required');
    }

    const isBlob = assets instanceof Blob;
    const fileUrl = isBlob ? window.URL.createObjectURL(assets) : assets;

    const { CancelToken } = axios;
    let cancel: Canceler | null = null;
    const client = new Promise<string>((resolve, reject) => {
        // Use Axios to download files
        axios
            .request({
                headers: header,
                url: fileUrl,
                method: 'GET',
                responseType: 'blob',
                cancelToken: new CancelToken(c => {
                    cancel = c;
                }),
                onDownloadProgress: event => {
                    const percent = (event?.progress || 0) * 100;
                    onProgress?.(percent);
                },
            })
            .then(response => {
                const fileStream = response.data as Blob;
                linkDownload(fileStream, fileName);
                resolve(fileName);
            })
            .catch(error => {
                reject(error);
            })
            .finally(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                isBlob && window.URL.revokeObjectURL(fileUrl);
            });
    });

    return {
        abort: () => cancel?.(),
        then: client.then.bind(client),
        catch: client.catch.bind(client),
    };
};

/**
 * Generate UUID
 * @returns UUID
 */
export const generateUUID = (): string => {
    if (window?.crypto?.randomUUID) return window.crypto.randomUUID();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        // eslint-disable-next-line no-bitwise
        const random = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });
};

interface GenerateStrOPtions {
    /** Whether contain uppercase letters */
    upperCase?: boolean;
    /** Whether contain lowercase letters */
    lowerCase?: boolean;
    /** Whether contain numbers */
    number?: boolean;
    /** Whether contain symbols */
    symbol?: boolean;
}
/**
 * Generate random string
 * @param {number} length String length, default is 8
 * @param {Object} [options] Options
 * @param {boolean} options.number Whether contain uppercase letters, default is `true`
 * @param {boolean} options.upperCase Whether contain uppercase letters, default is `true`
 * @param {boolean} options.lowerCase Whether contain lowercase letters, default is `false`
 * @param {boolean} options.symbol Whether contain symbols, default is `false`
 * @returns {string}
 */
export const genRandomString = (
    length = 8,
    options: GenerateStrOPtions = { upperCase: true, number: true },
): string => {
    const getCharacters = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const strategy: Record<keyof GenerateStrOPtions, string> = {
            upperCase: letters.toUpperCase(),
            lowerCase: letters,
            number: numbers,
            symbol: symbols,
        };
        if (options) {
            return Object.keys(options)
                .filter(key => options[key as keyof GenerateStrOPtions])
                .map(key => strategy[key as keyof GenerateStrOPtions])
                .join('');
        }

        return Object.values(strategy).join('');
    };
    const characters = getCharacters();

    return new Array(length)
        .fill(0)
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join('');
};

/**
 * Digital thousands of separators
 * @param number Number to be separated
 * @param separator Separator, default is `,`
 */
export const thousandSeparate = (number?: number | string, separator = ',') => {
    if (!number && number !== 0) return '';

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Get Object type
 * @param obj Any object
 * @returns
 */
export const getObjectType = (obj: any) => {
    const typeString = Object.prototype.toString.call(obj);
    const matched = typeString.match(/^\[object\s(\w+)\]$/);
    const type = matched && matched[1].toLocaleLowerCase();

    return type;
};

/** Whether it is a valid file name */
export const isFileName = (name: string) => {
    const fileNameRegex = /^[^\\/:*?"<>|]+\.[a-zA-Z0-9]+$/;
    return fileNameRegex.test(name);
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

/**
 * The nested object is expanded as a flat object, where the nested keys are connected
 * through the point number.
 *
 * @param obj The Object to be flattened
 * @returns
 *
 * @example
 * const nestedObj = { a: { b: { c: 1 } } };
 * const flattenedObj = flattenObject(nestedObj);
 * // flattenedObj -> { 'a.b.c': 1 }
 */
export function flattenObject<T extends Record<string, any>>(obj: T) {
    const result: Record<string, any> = {};

    for (const i in obj) {
        if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
            const temp = flattenObject(obj[i]);
            // eslint-disable-next-line guard-for-in
            for (const j in temp) {
                result[`${i}.${j}`] = temp[j];
            }
        } else {
            result[i] = obj[i];
        }
    }

    return result;
}

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
 * Delay execution
 * @param ms - Delay time (millisecond)
 * @returns return PromiseLike
 */
export const delay = (ms: number): PromiseLike<void> & { cancel: () => void } => {
    const { resolve, promise } = withPromiseResolvers<void>();
    const timer = setTimeout(resolve, ms);

    return {
        then: promise.then.bind(promise),
        cancel: () => {
            timer && clearTimeout(timer);
        },
    };
};

/**
 * Returns an object that contains `promise` and` Resolve`, and `Reject`, which is
 * suitable for reducing nested coding levels
 * @docs https://github.com/tc39/proposal-promise-with-resolvers
 */
export const withPromiseResolvers = <T>() => {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve: resolve!, reject: reject! };
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
 * Converts hexadecimal colors to rgba colors with transparency
 */
export const hexToRgba = (hex: string, alpha: number) => {
    // Remove the `#` sign from the front
    const color = hex.replace('#', '');

    // Converts hexadecimal colors to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Returns the rgba color with transparency
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
