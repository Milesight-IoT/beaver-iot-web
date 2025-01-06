/* eslint-disable no-useless-escape */
// import type { Rule } from 'ysd-iot/es/form';
import { isMatches, isMinValue } from './asserts';
import getErrorMessage, { EErrorMessages } from './getErrorMessage';
import {
    checkEmail,
    checkLettersAndNum,
    checkMinValue,
    checkMobilePhone,
    checkNumber,
    checkLength,
    checkPostalCode,
    checkRangeLength,
    checkStartWithNormalChar,
    checkUrl,
    checkMobileCNPhone,
    checkIsInt,
    checkRangeValue,
    checkPort,
} from './validator';
import type { Validate, TValidator } from './typings';

export * from './asserts';
// 导出所有的单条 validator
export * from './validator';
export { getErrorMessage, EErrorMessages };

export type { Validate, TValidator };
export type TChecker = () => Record<string, ReturnType<TValidator>>;

/**
 * validator 初始化辅助函数
 * 当前仅用于挂载 intl 对象，后续可根据需要进行扩展
 */
// export const init = intlInstanceGenerator;

// 以下是组合校验 -------
/**
 * Remark/Comments备注，正常是在 textarea
 * 对应 EErrorMessages.comments
 *
 * 最小1位，最大1024位
 * 支持任意字符。
 */
export const commentsChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 1024 }),
});

/**
 * Street/Address - 单行地址类
 *
 * 最小1位，最大255位
 * 支持任意字符。
 */
export const streetAddressChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 255 }),
});

/**
 * City/State/province - 国家城市
 * 最小1位，最大127位
 * 支持任意字符。
 */
export const cityChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 127 }),
});

/**
 * 生成一组 Email 的校验规则
 * 格式要求：
 * 只允许大小写英文字母、数字 和字符：@符号 下划线_ 中划线 -  加号+，英文句号. ，且必须由 大小写字母 或 数字 或 下划线_ 开头，.和-后面或者@前面一定要跟上A-Z，a-z，0-9，_
 * 必须符合邮箱格式XXX@XXX.XX
 */
export const emailCheckers: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 5, max: 255 }),
        checkStartWithNormalChar: checkStartWithNormalChar(),
        checkEmail: checkEmail(),
    };
};

/**
 * mobilePhoneChecker 和 postalCodeChecker 共享的 validator
 */
const contactFieldValidators: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 31 }),
    checkSpecialChar(value) {
        const message = getErrorMessage(EErrorMessages.numLetterSpaceSimpleSpecial);
        if (value && /[^a-zA-Z0-9\(\)\.\-+\*#\s]/.test(value)) {
            return message;
        }
        return Promise.resolve(true);
    },
});

/**
 * Mobile Number/Phone Number/Fax- 电话号码类
 *
 * 最小1位，最大31位
 * 允许输入数字，字母，空格和字符：().-+*#
 */
export const mobilePhoneChecker: TChecker = () => {
    return {
        ...contactFieldValidators(),
        checkMobilePhone: checkMobilePhone(),
    };
};

/**
 * 允许+86 中国大陆手机号码
 */
export const mobileCNPhoneChecker: TChecker = () => {
    return {
        checkMobileCNPhone: checkMobileCNPhone(),
    };
};

/**
 * Zip/Postal Code- 邮政编码类
 *
 * 最小1位，最大31位
 * 允许输入数字，字母，空格和字符：().-+*#
 */
export const postalCodeChecker: TChecker = () => {
    return {
        ...contactFieldValidators(),
        checkPostalCode: checkPostalCode(),
    };
};

/**
 * Name - 名称类，非用户名
 *
 * 最小1位，最大127位
 * 支持输入任意字符，不支持输入纯空格。（提交后用Trim（）去掉最前和最后的空格）
 */
export const normalNameChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 127 }),
    };
};

/**
 * First Name
 *
 * 最小1位，最大63位
 * 任意字符
 */
export const firstNameChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 63 }),
    };
};

/**
 * Last Name
 *
 * 最小1位，最大63位
 * 任意字符
 */
export const lastNameChecker: TChecker = firstNameChecker;

/**
 * Company Name
 *
 * 与 normalNameChecker 规则一样
 */
export const companyNameChecker: TChecker = normalNameChecker;

/**
 * SN（Yeastar 产品通用规范）
 */
export const SNLengthChecker: TChecker = () => ({
    checkLettersAndNum: checkLettersAndNum(),
    checkLength: checkLength({
        enum: [12, 16],
        message: getErrorMessage(EErrorMessages.sn),
    }),
});

/**
 * 金额输入
 *
 * 小数点前最大10位，小数点后2位
 */
export const moneyChecker: TChecker = () => ({
    // 只能是数值
    checkNumber: checkNumber(),
    // 只能是正数
    checkMinValue: checkMinValue({ min: 0 }),
    // 校验整数位
    checkIntegerLength(value) {
        const maxLength = 10;
        const message = getErrorMessage(EErrorMessages.amountMaxLength, { 0: maxLength });

        try {
            // eslint-disable-next-line
            if (value && isMinValue(value, Math.pow(10, maxLength - 1))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    },

    // 校验小数位
    checkDecimalsLength(value) {
        const maxLength = 2;
        const message = getErrorMessage(EErrorMessages.amountDecimalsMaxLength, { 0: maxLength });

        try {
            if (value % 1 !== 0 && isMatches(value, new RegExp(`\\.\\d{${maxLength + 1},}$`))) {
                return message;
            }
        } catch (e) {
            return message;
        }

        return Promise.resolve(true);
    },
});

/**
 * 域名/服务器地址
 *
 * 最小3位，最大255位
 * 任意字符
 */
export const hostChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 255 }),
        checkUrl: checkUrl(),
    };
};
/**
 * 端口号
 *
 * 最小1位，最大5位
 * 1-65535范围内的整数,纯数字
 */
export const portChecker: TChecker = () => {
    return {
        checkPort: checkPort(),
    };
};

/**
 * userName
 *
 * 最小5位，最大255位
 * 至少包含大小写英文字母，支持除了空格外的任意字符，不支持除英文外的多语言
 */
export const userNameChecker: TChecker = () => {
    return {
        checkUsername(value) {
            const message = getErrorMessage(EErrorMessages.username);

            try {
                if (value && !isMatches(value, /^(?=.*[A-Z])(?=.*[a-z])[\u0020-\u007E]{5,255}$/)) {
                    return message;
                }
            } catch (e) {
                return message;
            }

            return Promise.resolve(true);
        },
    };
};

/**
 * 密码
 *
 * 最小8位，最大63位
 * 至少包含大小写英文字母，支持除了空格外的任意字符，不支持除英文外的多语言
 */
export const passwordChecker: TChecker = () => {
    return {
        checkPassword(value) {
            const message = getErrorMessage(EErrorMessages.password);

            try {
                if (
                    value &&
                    !isMatches(value, /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[\u0021-\u007E]{8,63}$/)
                ) {
                    return message;
                }
            } catch (e) {
                return message;
            }

            return Promise.resolve(true);
        },
    };
};

/**
 * url合法性
 * 最大 1024 位
 */
export const urlChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 1024 }),
        checkUrl: checkUrl(),
    };
};

/**
 * 秒数校验规则
 * 1. 必须为整数
 * 2. min <= 值 <= max，min 默认为 1，max 默认为 30 * 24 * 60 * 60
 */
export const secondsChecker: TChecker = (min = 1, max = 30 * 24 * 60 * 60) => {
    return {
        checkIsInt: checkIsInt(),
        checkRangeValue: checkRangeValue({ min, max }),
    };
};
