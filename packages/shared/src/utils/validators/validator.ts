import validator from 'validator';
import {
    isDecimals,
    // isEmail,
    isEmpty,
    isGtValue,
    isHexadecimal,
    isIP,
    isMACAddress,
    isMatches,
    isMaxLength,
    isMaxValue,
    isMinLength,
    isMinValue,
    isMobilePhone,
    isNumeric,
    isPort,
    isPostalCode,
    isRangeLength,
    isRangeValue,
    isURL,
    isAscii,
    isFQDN,
    isInt,
} from './asserts';
import getErrorMessage, { EErrorMessages } from './getErrorMessage';
import type { TValidator } from './typings';

/**
 * Check required
 *
 * I18N key: EErrorMessages.required
 */
export const checkRequired: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.required);

    return value => {
        try {
            if (!isEmpty(value)) {
                return Promise.resolve(true);
            }
        } catch (e) {
            // do nothing
        }

        return message;
    };
};

/**
 * Check min value
 *
 * I18N key: EErrorMessages.minValue
 */
export const checkMinValue: TValidator<{ min: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.minValue, {
            0: rule.min,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !isMinValue(value, rule.min)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return true;
    };
};

/**
 * Check max value
 *
 * I18N key: EErrorMessages.maxValue
 */
export const checkMaxValue: TValidator<{ max: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.maxValue, {
            0: rule.max,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !isMaxValue(value, rule.max)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};
/**
 * Check range value
 *
 * I18N key: EErrorMessages.rangeValue
 */
export const checkRangeValue: TValidator<{ min: number; max: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.rangeValue, {
            0: rule.min,
            1: rule.max,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (!isEmpty(value) && !isRangeValue(value, rule.min, rule.max)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check value is one of the specified values
 */
export const checkValue: TValidator<{ enum: number[] }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.value, {
            // @ts-ignore rule is possibly 'undefined'
            0: rule.enum.join(', '),
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !rule.enum.some(val => isRangeValue(value, val, val))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check min length
 *
 * I18N key: EErrorMessages.minLength
 */
export const checkMinLength: TValidator<{ min: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.minLength, {
            0: rule.min,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !isMinLength(value, rule.min)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check max length
 *
 * I18N key: EErrorMessages.maxLength
 */
export const checkMaxLength: TValidator<{ max: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.maxLength, {
            1: rule.max,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !isMaxLength(value, rule.max)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check range length
 *
 * I18N key: EErrorMessages.rangeLength
 */
export const checkRangeLength: TValidator<{ min: number; max: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.rangeLength, {
            0: rule.min,
            1: rule.max,
        });

    return value => {
        const val = `${value}`;
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (val && !isRangeLength(val, rule.min, rule.max)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check length is one of the specified lengths
 */
export const checkLength: TValidator<{ enum: number[] }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.length, {
            0: rule.enum.join(','),
        });

    return value => {
        try {
            if (value && !rule.enum.some((len: number) => isRangeLength(value, len, len))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check IPv4 address
 *
 * I18N key: EErrorMessages.ipAddress
 */
export const checkIPAddressV4: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.ipAddress);

    return value => {
        try {
            if (value && !isIP(value, 4)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check IPv6 address
 *
 * I18N key: EErrorMessages.ipv6Address
 */
export const checkIPAddressV6: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.ipv6Address);

    return value => {
        try {
            if (value && !isIP(value, 6)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check MAC address
 *
 * I18N key: EErrorMessages.mac
 */
export const checkMACAddress: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.mac);

    return value => {
        try {
            if (value && !isMACAddress(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check Mobile Phone Number
 *
 * I18N key: EErrorMessages.phone
 */
export const checkMobilePhone: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.phone);

    return value => {
        try {
            if (value && !isMobilePhone(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check Mobile CN Phone Number (+86)
 */
export const checkMobileCNPhone: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.cnPhone);

    return value => {
        try {
            if (value && !isMobilePhone(value, 'zh-CN', { loose: false })) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check postal code
 */
export const checkPostalCode: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.postalCode);

    return value => {
        try {
            if (value && !isPostalCode(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check number
 *
 * I18N key: EErrorMessages.number
 */
export const checkNumber: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.number);

    return value => {
        try {
            if (value && !isNumeric(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check number (no zero)
 *
 * I18N key: EErrorMessages.numberNoZero
 */
export const checkNumberNoZero: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.numberNoZero);

    return value => {
        try {
            if (value && !(isNumeric(value) && isGtValue(value, 0))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check hexadecimal number
 *
 * I18N key: EErrorMessages.hexNumber
 */
export const checkHexNumber: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.hexNumber);

    return value => {
        try {
            if (value && !isHexadecimal(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check port
 *
 * I18N key: EErrorMessages.port
 */
export const checkPort: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.port);

    return value => {
        // If the value obtained is a number, convert it to a string
        let val = value;
        if (typeof val === 'number') {
            val = String(val);
        }

        try {
            if (value && !isPort(val)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};
/**
 * Check email address
 *
 * I18N key: EErrorMessages.email
 */
export const checkEmail: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.email);
    const emailReg =
        /^\w+((-\w+)|(\.\w+)|(\+\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.([A-Za-z0-9]+)$/;

    return value => {
        try {
            if (value && !emailReg.test(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check decimals
 *
 * I18N key: EErrorMessages.decimals
 */
export const checkDecimals: TValidator<validator.IsDecimalOptions> = rule => {
    const { message = getErrorMessage(EErrorMessages.decimals), ...options } = rule || {};

    return value => {
        try {
            if (
                value &&
                !isDecimals(value, {
                    decimal_digits: '1,',
                    force_decimal: false,
                    ...options,
                })
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check no decimals
 *
 * I18N key: EErrorMessages.number
 */
export const checkNoDecimals: TValidator<{ len: number }> = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.number);

    return value => {
        try {
            if (
                value &&
                isDecimals(
                    value,
                    rule.len
                        ? {
                              decimal_digits: `0,${rule.len}`,
                          }
                        : {},
                )
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check letters
 *
 * I18N key: EErrorMessages.letters
 */
export const checkLetters: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.letters);

    return value => {
        try {
            if (value && !isMatches(value, /^[a-zA-Z]+$/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check letters and num
 *
 * I18N key: EErrorMessages.lettersAndNum
 */
export const checkLettersAndNum: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.lettersAndNum);

    return value => {
        try {
            if (value && !isMatches(value.toString(), /^[a-zA-Z0-9]+$/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check at least one lowercase letter
 */
export const checkAtLeastOneLowercaseLetter: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.atLeastOneLowercaseLetter);

    return value => {
        try {
            if (value && !isMatches(value, /[a-z]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check at least one uppercase letter
 */
export const checkAtLeastOneUppercaseLetter: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.atLeastOneUppercaseLetter);

    return value => {
        try {
            if (value && !isMatches(value, /[A-Z]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check at least one number
 */
export const checkAtLeastOneNum: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.atLeastOneNum);

    return value => {
        try {
            if (value && !isMatches(value, /[0-9]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check at least one whitespace
 */
export const checkHasWhitespace: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.notIncludeWhitespace);

    return value => {
        try {
            if (value && isMatches(value, /[\s\r\n\t]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check start with a-zA-Z0-9_
 */
export const checkStartWithNormalChar: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.startWithNormalChar);

    return value => {
        try {
            if (value && !isMatches(value, /^[a-z-A-Z0-9_]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check start with specify characters
 */
export const checkStartWithSpecialChar: TValidator<{ char: string }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.startWithSpecialChar, {
            0: rule.char,
        });

    return value => {
        try {
            if (value && !value.startsWith(rule.char)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check URL
 *
 * I18N key: EErrorMessages.url
 */
export const checkUrl: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.url);

    return value => {
        try {
            if (value && !isURL(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check the maximum value of the number
 */
export const checkNumericMaxValue: TValidator<{ max: number }> = rule => {
    const { max } = rule;
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.maxValue, {
            0: max,
        });

    return value => {
        try {
            if (
                value &&
                !Number.isNaN(Number(value)) &&
                (max || max === 0) &&
                !Number.isNaN(Number(max)) &&
                value > max
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check the minimum value of the number
 */
export const checkNumericMinValue: TValidator<{ min: number }> = rule => {
    const { min } = rule;
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.minValue, {
            0: min,
        });

    return value => {
        try {
            if (
                value &&
                !Number.isNaN(Number(value)) &&
                (min || min === 0) &&
                !Number.isNaN(Number(min)) &&
                value < min
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check ASCII characters without spaces
 */
export const checkNoIncludesSpaceAscii: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.noIncludesSpaceAscii);

    return value => {
        try {
            if (value && (!isAscii(value) || value?.includes(' '))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check the string that only contains uppercase letters, lowercase letters, numbers,
 * and underscores
 */
export const checkCharStringRulesOne: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.stringRulesOne);

    return value => {
        try {
            if (value && !isMatches(value, /^[a-z-A-Z0-9_-]+$/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check the string that only contains uppercase letters, lowercase letters, numbers,
 * and !"#$%&'()*+,-./:;<=>@[]^_`{|}~
 */
export const checkCharStringRulesTwo: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.stringRulesTwo);

    return value => {
        try {
            if (value && !isMatches(value, /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>@[\]^_`{|}~]+$/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check if it is ipv4/ipv6 or domain or url
 */
export const checkIsIpOrDomain: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.ipOrDomain);

    return value => {
        try {
            if (
                value &&
                !isIP(value, 4) &&
                !isIP(value, 6) &&
                !isFQDN(value) &&
                !isURL(value, {
                    require_protocol: true,
                    protocols: ['http', 'https', 'ftp', 'ftps', 'ws', 'wss'],
                })
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check integer (positive integer, negative integer and zero)
 */
export const checkIsInt: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.integerPositiveNegativeZero);

    return value => {
        try {
            if (value && !isInt(value)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check positive integer (positive integer and zero)
 */
export const checkIsPositiveInt: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.integerPositiveZero);

    return value => {
        try {
            if (value && (!isInt(value) || value < 0)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check positive integer
 */
export const checkPositiveInt: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.integerPositive);

    return value => {
        try {
            if (value && !isInt(value, { gt: 0 })) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check if it starts with http/https
 */
export const checkStartWithHttpOrHttps: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.startWithHttpOrHttps);

    return value => {
        try {
            if (
                value &&
                !isURL(value, {
                    require_protocol: true,
                    protocols: ['http', 'https'],
                })
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check if it starts with ws/wss
 */
export const checkStartWithWsOrWss: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.startWithWsOrWss);

    return value => {
        try {
            if (
                value &&
                !isURL(value, {
                    require_protocol: true,
                    protocols: ['ws', 'wss'],
                })
            ) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check if it contains the characters: &/\:*?'"<>|%
 */
export const checkNotAllowStringRuleOne: TValidator = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.notAllowStringOne, {
            0: '&/\\:*?\'"<>|%',
        });

    return value => {
        try {
            if (value && isMatches(value, /[&/\\:*?'"<>|%]/)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * Check if the value matches the regular expression
 */
export const checkRegexp: TValidator<{ regexp: RegExp }> = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.regexp, { 1: rule.regexp });

    return value => {
        try {
            if (value && !isMatches(value, rule.regexp)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};
