import { isNil, isNumber, isFinite } from 'lodash-es';
import { genRandomString } from '@milesight/shared/src/utils/tools';
import { isInt, isMatches } from '@milesight/shared/src/utils/validators';

/**
 * Verify whether it is a numeric value
 * @param num
 * @returns boolean
 */
export const isValidNumber = (num: any): boolean => !isNil(num) && !isNaN(+num);

/**
 * Convert with decimal
 * @param number
 * @returns number
 */
export const convertWithDecimal = (number: number, fractionDigits: number = 1): number => {
    const value = number.toFixed(fractionDigits);
    if (value.at(-1) !== '0') {
        return parseFloat(value);
    }
    return parseFloat(
        [...value]
            .map((char: string, index: number, arr: string[]) => {
                return index === arr.length - 1 ? String(randomValueInRange(1, 9)) : char;
            })
            .join(''),
    );
};

/**
 * Returns a pseudorandom number between (min, max)
 * @param min
 * @param max
 * @param fractionDigits
 * @returns number
 */
export const randomValueInRange = (min: number, max: number, fractionDigits?: number): number => {
    if (fractionDigits) {
        return convertWithDecimal(Math.random() * (max - min) + min, fractionDigits);
    }
    return Math.round(Math.random() * (max - min)) + min;
};

/**
 * Returns a pseudorandom number greater min
 * @param min
 * @param fractionDigits
 * @returns number
 */
export const randomGreaterValue = (min: number, fractionDigits?: number): number => {
    if (fractionDigits) {
        return convertWithDecimal(Math.random() * 10 + min, fractionDigits);
    }
    return Math.round(Math.random() * 10) + min;
};

/**
 * Returns a pseudorandom number less max
 * @param max
 * @param fractionDigits
 * @returns number
 */
export const randomLessValue = (max: number, fractionDigits?: number): number => {
    if (fractionDigits) {
        return convertWithDecimal(Math.random() * max, fractionDigits);
    }
    return Math.round(Math.random() * max);
};

/**
 * Returns a pseudorandom string length between (min, max)
 * @param min
 * @param max
 * @returns string
 */
export const randomInLengthRange = (min: number, max: number): string => {
    return genRandomString(randomValueInRange(min, max), {
        lowerCase: true,
        number: true,
    });
};

/**
 * Returns a pseudorandom string length greater min
 * @param min
 * @returns string
 */
export const randomGreaterLength = (min: number): string => {
    return genRandomString(randomGreaterValue(min), {
        lowerCase: true,
        number: true,
    });
};

/**
 * Returns a pseudorandom string length less max
 * @param max
 * @returns string
 */
export const randomLessLength = (max: number): string => {
    return genRandomString(randomLessValue(max), {
        lowerCase: true,
        number: true,
    });
};

/**
 * Generate a hexadecimal string randomly
 * @param length
 * @param upperCase
 * @returns string
 */
export const randomHexString = (length: number, upperCase: boolean = true): string => {
    const hexChars = '0123456789abcdef';
    const tansHexChars = upperCase ? hexChars.toLowerCase() : hexChars;
    return Array.from(
        { length },
        () => tansHexChars[randomValueInRange(0, tansHexChars.length - 1)],
    ).join('');
};

/**
 * Generate a hexadecimal base64 randomly
 * @param width
 * @param height
 * @returns base64
 */
export const randomImageBase64 = (
    width: number = randomValueInRange(12, 48),
    height: number = randomValueInRange(12, 48),
): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const imageData = ctx.createImageData(width, height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(Math.random() * 256);
            data[i + 1] = Math.floor(Math.random() * 256);
            data[i + 2] = Math.floor(Math.random() * 256);
            data[i + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
        return `data:image/png;base64,${canvas.toDataURL().split(',')[1]}`;
    }
    return '';
};

/**
 * Reference: https://github.com/faker-js/faker
 * @param width (1, 2000)
 * @param height (1, 2000)
 * @returns string
 */
export const randomImageUrl = (
    width: number = randomValueInRange(1, 2000),
    height: number = randomValueInRange(1, 2000),
): string => {
    return `https://loremflickr.com/${width}/${height}?lock=${randomValueInRange(1, 100)}`;
};

/**
 * Randomly generate matching strings based on the given regular expression
 * @param reg {regex}
 * @returns string
 */
export const randomStringByReg = (reg: string): string => {
    try {
        RegExp(reg);
        return '';
    } catch (e) {}
    return '';
};

/**
 * Randomly generate an item in the given array based on it
 * @param list {ApiKey[]}
 * @returns ApiKey | undefined
 */
export const randomOneByArray = <T extends ApiKey>(list: T[]): T | undefined => {
    if (!list.length) {
        return undefined;
    }
    return list[randomValueInRange(0, list.length - 1)];
};

/** ======== validator ============================= */

/**
 * check is within a certain range integer
 * @param value
 * @param max
 * @returns Returns true if value is correctly classified, else false.
 */
export const isRangeIntValue = (value: number, min: number, max: number): boolean => {
    return isInt(value, {
        min,
        max,
    });
};
/**
 * check is less than a certain value integer
 * @param value
 * @param max
 * @returns Returns true if value is correctly classified, else false.
 */
export const isMinIntValue = (value: number, min: number): boolean => {
    return isInt(value, {
        min,
    });
};
/**
 * check is greater than a certain value integer
 * @param value
 * @param max
 * @returns  Returns true if value is correctly classified, else false.
 */
export const isMaxIntValue = (value: number, max: number): boolean => {
    return isInt(value, {
        max,
    });
};

/**
 * Determine whether it is a numerical value and whether the decimal places are legal
 * @param value
 * @param fractionDigits
 * @returns
 */
export const isFractionDigits = (
    value: string | number,
    fractionDigits: string | number,
): boolean => {
    if (isValidNumber(fractionDigits) && +fractionDigits >= 0) {
        if (+fractionDigits === 0) {
            return Number.isInteger(value);
        }
        return (
            isDouble(value, true) &&
            String(value).slice(String(value).indexOf('.') + 1).length === +fractionDigits
        );
    }
    return false;
};

/**
 * Checks if value is classified as a Number and not NaN，finite
 * @param value
 * @param checkDecimal
 * @returns Returns true if value is correctly classified, else false.
 */
export const isDouble = (value: string | number, checkDecimal?: boolean): boolean => {
    if (!isNumber(value) || isNaN(+value) || !isFinite(+value)) {
        return false;
    }
    if (checkDecimal && +value % 1 === 0) {
        return false;
    }
    return true;
};
/**
 *  Verify whether the image base64 is legal
 * @param base64String
 * @returns boolean
 */
export const isBase64Image = (base64String: string): boolean => {
    if (!isMatches(base64String, /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/)) {
        return false;
    }

    try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        return buffer.length > 0;
    } catch (error) {
        return false;
    }
};
/**
 * Check the url image address
 * @param url
 * @returns boolean
 */
export const isUrlImage = (url: string): boolean => {
    return /^https?:\/\//.test(url);
};
