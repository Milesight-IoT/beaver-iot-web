/* eslint-disable no-useless-escape */
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
// Export all single validator
export * from './validator';
export { getErrorMessage, EErrorMessages };

export type { Validate, TValidator };
export type TChecker = () => Record<string, ReturnType<TValidator>>;

/**
 * Remark/Comments checker
 * I18N key: EErrorMessages.comments
 *
 * 1. Min 1, Max 1024
 * 2. Any characters
 */
export const commentsChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 1024 }),
});

/**
 * Street/Address
 *
 * 1. Min 1, Max 255
 * 2. Any characters
 */
export const streetAddressChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 255 }),
});

/**
 * City/State/province
 *
 * 1. Min 1, Max 127
 * 2. Any characters
 */
export const cityChecker: TChecker = () => ({
    checkRangeLength: checkRangeLength({ min: 1, max: 127 }),
});

/**
 * Generate a set of email validation rules
 *
 * Rules:
 * 1. Start with a-zA-Z0-9_
 * 2. Must be composed of the English letters, numbers, and characters (`_-+.`)
 * 3. Behind the `.`, `-` or before `@` must be followed by a-zA-Z0-9_
 * 4. Must conform to email format XXX@XXX.XX
 */
export const emailCheckers: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 5, max: 255 }),
        checkStartWithNormalChar: checkStartWithNormalChar(),
        checkEmail: checkEmail(),
    };
};

/**
 * Contact field validators that are shared by mobilePhoneChecker and postalCodeChecker
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
 * Mobile Number/Phone Number/Fax
 *
 * 1. Min 1, Max 31
 * 2. Allow input numbers, letters, spaces, and characters: ().-+*#
 */
export const mobilePhoneChecker: TChecker = () => {
    return {
        ...contactFieldValidators(),
        checkMobilePhone: checkMobilePhone(),
    };
};

/**
 * Mobile Number that from China (+86)
 */
export const mobileCNPhoneChecker: TChecker = () => {
    return {
        checkMobileCNPhone: checkMobileCNPhone(),
    };
};

/**
 * Zip/Postal Code
 *
 * 1. Min 1, Max 31
 * 2. Allow input numbers, letters, spaces, and characters: ().-+*#
 */
export const postalCodeChecker: TChecker = () => {
    return {
        ...contactFieldValidators(),
        checkPostalCode: checkPostalCode(),
    };
};

/**
 * Name Checker
 *
 * 1. Min 1, Max 63
 * 2. Allow any characters that are not spaces
 */
export const normalNameChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 127 }),
    };
};

/**
 * First Name
 *
 * 1. Min 1, Max 63
 * 2. Allow any characters
 */
export const firstNameChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 63 }),
    };
};

/**
 * Last Name
 *
 * 1. Min 1, Max 63
 * 2. Allow any characters
 */
export const lastNameChecker: TChecker = firstNameChecker;

/**
 * Company Name
 *
 * The same as normalNameChecker
 */
export const companyNameChecker: TChecker = normalNameChecker;

/**
 * SN (The General Specification for Yeastar Products)
 */
export const SNLengthChecker: TChecker = () => ({
    checkLettersAndNum: checkLettersAndNum(),
    checkLength: checkLength({
        enum: [12, 16],
        message: getErrorMessage(EErrorMessages.sn),
    }),
});

/**
 * Money Checker
 *
 * Up to 10 digits before the decimal point and up to 2 digits after the decimal point
 */
export const moneyChecker: TChecker = () => ({
    // Check number
    checkNumber: checkNumber(),
    // Check min value
    checkMinValue: checkMinValue({ min: 0 }),
    // Check integer length
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

    // Check decimals length
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
 * Host checker
 *
 * 1. Min 1, Max 255
 * 2. Allow any characters
 */
export const hostChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 255 }),
        checkUrl: checkUrl(),
    };
};
/**
 * Port number
 * Port checker
 *
 * 1. Min 1, Max 5
 * 2. Integer between 1 and 65535
 */
export const portChecker: TChecker = () => {
    return {
        checkPort: checkPort(),
    };
};

/**
 * userName
 *
 * 1. Min 5, Max 255
 * 2. At least one uppercase letter, one lowercase letter, and any characters except spaces
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
 * password
 * Password checker
 *
 * 1. Min 8, Max 63
 * 2. At least one uppercase letter, one lowercase letter, and any characters except spaces
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
 * Url checker
 *
 * 1. Min 1, Max 1024
 */
export const urlChecker: TChecker = () => {
    return {
        checkRangeLength: checkRangeLength({ min: 1, max: 1024 }),
        checkUrl: checkUrl(),
    };
};

/**
 * Second check rule
 * Seconds checker
 *
 * 1. Must be an integer
 * 2. min <= value <= max, min defaults to 1, max defaults to 30 * 24 * 60 * 60
 */
export const secondsChecker: TChecker = (min = 1, max = 30 * 24 * 60 * 60) => {
    return {
        checkIsInt: checkIsInt(),
        checkRangeValue: checkRangeValue({ min, max }),
    };
};
