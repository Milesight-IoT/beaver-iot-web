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
 * 必填项
 * 对应 EErrorMessages.required
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
 * 最小值
 * 对应 EErrorMessages.minValue
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
 * 最大值
 * 对应 EErrorMessages.maxValue
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
 * 最大最小值
 * 对应 EErrorMessages.rangeValue
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
 * 检查值是否为指定值中的一个
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
 * 最小位数
 * 对应 EErrorMessages.minLength
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
 * 最大位数
 * 对应 EErrorMessages.maxLength
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
 * 最大最小位数
 * 对应 EErrorMessages.rangeLength
 */
export const checkRangeLength: TValidator<{ min: number; max: number }> = rule => {
    const message =
        rule?.message ||
        getErrorMessage(EErrorMessages.rangeLength, {
            0: rule.min,
            1: rule.max,
        });

    return value => {
        try {
            // @ts-ignore rule is possibly 'undefined'
            if (value && !isRangeLength(value, rule.min, rule.max)) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    };
};

/**
 * 校验长度是否是指定的长度，可以通过 enum 指定多个长度
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
 * IPv4类 IP地址/掩码/网关
 * 对应 EErrorMessages.ipAddress
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
 * IPv6类 IP地址/掩码/网关
 * 对应 EErrorMessages.netmask
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
 * Mac地址
 * 对应 EErrorMessages.mac
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
 * Mobile Number/Phone Number/Fax- 电话号码类
 * 对应 EErrorMessages.phone
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
 * 允许+86 中国大陆手机号码
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
 * Zip/Postal Code- 邮政编码类
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
 * 十进制数值
 * 对应 EErrorMessages.number
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
 * 十进制数值，无0
 * 对应 EErrorMessages.numberNoZero
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
 * 十六进制数值
 * 对应 EErrorMessages.hexNumber
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
 * 端口：网络端口
 * 对应 EErrorMessages.port
 */
export const checkPort: TValidator = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.port);

    return value => {
        // 若获取到的值为数字，则转换为字符串
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
 * Email Address - 邮箱地址
 * 对应 EErrorMessages.email
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
 * 是否小数
 * 对应 EErrorMessages.decimals
 */
export const checkDecimals: TValidator<{ len: number }> = rule => {
    const message = rule?.message || getErrorMessage(EErrorMessages.decimals);

    return value => {
        try {
            if (
                value &&
                !isDecimals(
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
 * 不支持小数，小数则报错 Promise.reject
 * 对应 EErrorMessages.number， 要求输入纯数字
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
 * 支持大小写字母
 * 对应 EErrorMessages.letters
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
 * 支持数字和大小写字母
 * 对应 EErrorMessages.lettersAndNum
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
 * 至少包含一个小写字母
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
 * 至少包含一个大写字母
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
 * 至少包含一个数字
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
 * 不支持有空格
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
 * 必须以 a-zA-Z0-9_ 开头
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
 * Url Address - URL地址
 * 对应 EErrorMessages.url
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
 * 数字的最大值检验
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
 * 数字的最小值检验
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
 * 不含空格的ASCII字符
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
 * 仅允许输入大写字母、小写字母、数字及“_”、“-”
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
 * 仅允许输入大写字母、小写字母、数字及!"#$%&'()*+,-./:;<=>@[]^_`{|}~
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
 * 检测是否为 ipv4/ipv6 或域名 或 url
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
 * 整数校验（正整数、负整数和零）
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
 * 正整数校验（正整数和零）
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
 * 必须以 http/https 开头
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
 * 必须以 ws/wss 开头
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
 * 不允许字符: &/\:*?'"<>|%
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
