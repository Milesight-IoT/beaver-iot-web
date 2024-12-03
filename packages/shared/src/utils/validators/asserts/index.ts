/* eslint-disable no-useless-escape */
import { isEqual as _isEqual } from 'lodash-es';
import validator from 'validator';

/**
 * 检查值是否为空
 */
export function isEmpty(value: any, options?: validator.IsEmptyOptions): boolean {
    if (typeof value === 'string') {
        return validator.isEmpty(value, options);
    }
    return value === null || value === undefined || value.length === 0;
}

/**
 * 验证 value 中是否含有 seed
 */
export function isContains(value: string, seed: any): boolean {
    return validator.contains(value, seed);
}

/**
 * 验证是否相等
 * 底层引用了 lodash 的 isEqual
 */
export function isEqual(valueA: any, valueB: any): boolean {
    return _isEqual(valueA, valueB);
}

/**
 * 检查是否是信用卡号码
 */
export function isCreditCard(value: string): boolean {
    return validator.isCreditCard(value);
}

/**
 * 检查 value 是否是一个可以被 number 整除的数字
 */
export function isDivisibleBy(value: number | string, number: number): boolean {
    return validator.isDivisibleBy(`${value}`, number);
}

/**
 * 是否带有小数数值
 */
export function isDecimals(value: number | string, options?: validator.IsDecimalOptions): boolean {
    return validator.isDecimal(`${value}`, {
        force_decimal: true,
        ...(options || {}),
    });
}

/**
 * 检查是否是邮件地址
 */
export function isEmail(value: string, options?: validator.IsEmailOptions): boolean {
    return validator.isEmail(value, options);
}

/**
 * 是否是域名
 */
export function isFQDN(value: string, options?: validator.IsFQDNOptions): boolean {
    return validator.isFQDN(value, options);
}

/**
 * 是否是浮点数
 *
 * 不对外暴露，要判断是否是小数，使用 isDecimals
 */
function isFloat(value: number | string, options?: validator.IsFloatOptions): boolean {
    return validator.isFloat(`${value}`, options);
}

/**
 * 是否 value <= max
 */
export function isMaxValue(value: number | string, max: number): boolean {
    return isFloat(value, {
        max,
    });
}

/**
 * 是否 value >= min
 */
export function isMinValue(value: number, min: number): boolean {
    return isFloat(value, {
        min,
    });
}

/**
 * 是否 min <= value <= max
 */
export function isRangeValue(value: number, min: number, max: number): boolean {
    return isFloat(value, {
        min,
        max,
    });
}

/**
 * 是否 value > gt
 */
export function isGtValue(value: number, gt: number): boolean {
    return isFloat(value, {
        gt,
    });
}

/**
 * 是否 value < lt
 */
export function isLtValue(value: number, lt: number): boolean {
    return isFloat(value, {
        lt,
    });
}

/**
 * 是否 gt < value < lt
 */
export function isGLRange(value: number, gt: number, lt: number): boolean {
    return isFloat(value, {
        gt,
        lt,
    });
}

/**
 * 是否是十六进制数字
 */
export function isHexadecimal(value: string): boolean {
    return validator.isHexadecimal(value);
}

/**
 * 是否是IP地址值，version为4或者6
 */
export function isIP(value: string, version?: validator.IPVersion): boolean {
    return validator.isIP(value, version);
}

/**
 * 是否是IP段，version为4或者6
 */
export function isIPRange(value: string, version?: validator.IPVersion): boolean {
    return validator.isIPRange(value, version);
}

/**
 * 是否是整数
 */
export function isInt(value: string | number, options?: validator.IsIntOptions): boolean {
    return validator.isInt(`${value}`, options);
}

/**
 * 使用JSON.parse判断是否是json
 */
export function isJSON(value: string): boolean {
    return validator.isJSON(value);
}

/**
 * 判断字符串的长度是否不大于最大长度 max
 */
export function isMaxLength(value: string, max: number): boolean {
    return validator.isLength(value, {
        max,
    });
}

/**
 * 判断字符串的长度是否不小于最小长度 min
 */
export function isMinLength(value: string, min: number): boolean {
    return validator.isLength(value, {
        min,
    });
}

/**
 * 判断字符串的长度是否在一个范围内
 * min 最小长度
 * max 最大长度
 */
export function isRangeLength(value: string, min: number, max: number): boolean {
    return validator.isLength(value, {
        min,
        max,
    });
}

/**
 * 是否小写
 */
export function isLowercase(value: string): boolean {
    return validator.isLowercase(value);
}

/**
 * 是否是MAC地址
 */
export function isMACAddress(value: string, options?: validator.IsMACAddressOptions): boolean {
    return validator.isMACAddress(value, options);
}

/**
 * 是否是MD5加密的哈希值
 */
export function isMD5(value: string): boolean {
    return validator.isMD5(value);
}

/**
 * 是否是MIME type值
 */
export function isMimeType(value: string): boolean {
    return validator.isMimeType(value);
}

/**
 * 是否仅仅包含数字
 */
export function isNumeric(value: string, options?: validator.IsNumericOptions): boolean {
    return validator.isNumeric(value, options);
}

/**
 * 是否是一个URL地址
 */
export function isURL(value: string, options?: validator.IsURLOptions): boolean {
    return validator.isURL(value, options);
}

/**
 * 是否大写
 */
export function isUppercase(value: string): boolean {
    return validator.isUppercase(value);
}

/**
 * 是否匹配，利用match方法，其中匹配的模式可以作为第三个参数，当然也可以卸载正则表达式pattern中
 */
export function isMatches(value: string, pattern: RegExp): boolean {
    return validator.matches(value, pattern);
}

/**
 * 是否是移动电话号码
 */
export function isMobilePhone(
    value: number | string,
    locale?: 'any' | validator.MobilePhoneLocale | validator.MobilePhoneLocale[],
    options?: validator.IsMobilePhoneOptions & {
        loose: boolean;
    },
): boolean {
    const { loose = true, ...otherOptions } = options || {};
    if (loose) {
        return /^[a-zA-Z0-9\(\)\.\-+\*#]{1,31}$/.test(`${value}`);
    }

    return validator.isMobilePhone(`${value}`, locale || 'any', otherOptions);
}

/**
 * 是否有效的邮编号码
 */
export function isPostalCode(
    value: number | string,
    locale?: 'any' | validator.PostalCodeLocale,
    options?: { loose: boolean },
): boolean {
    const { loose = true } = options || {};

    if (loose) {
        return /^[a-zA-Z0-9\(\)\.\-+\*#\s]{1,31}$/.test(`${value}`);
    }

    return validator.isPostalCode(`${value}`, locale || 'any');
}

/**
 * 是否是端口号
 */
export function isPort(value: string): boolean {
    return validator.isPort(value);
}

/**
 * 是否是包含汉字
 */
export function isChinaString(value: string): boolean {
    const patrn = /[\u4E00-\u9FFF]+/g;
    return patrn.test(`${value}`);
}

/**
 * 是否为 ASCII 字符
 */
export function isAscii(value: string): boolean {
    return validator.isAscii(value);
}

/**
 * 是否是字母
 */
export function isAlpha(value: string): boolean {
    return validator.isAlpha(value);
}
