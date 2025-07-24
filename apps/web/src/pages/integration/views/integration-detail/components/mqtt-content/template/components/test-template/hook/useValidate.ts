import { useMemo } from 'react';
import { isString, isBoolean, isInteger } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    isRangeLength,
    isRangeValue,
    isMinValue,
    isMaxValue,
    isMinLength,
    isMaxLength,
    isHexadecimal,
    isMatches,
} from '@milesight/shared/src/utils/validators';
import { ENTITY_ACCESS_MODE, ENTITY_DATA_VALUE_TYPE, ENTITY_TYPE } from '@/constants';
import {
    isBase64Image,
    isDouble,
    isFractionDigits,
    isMaxIntValue,
    isMinIntValue,
    isRangeIntValue,
    isUrlImage,
    isValidNumber,
} from '../utils';

enum ErrorIntlKey {
    required = 'workflow.valid.required',
    enum = 'setting.valid.enum',
    isString = 'setting.valid.string',
    isLong = 'setting.valid.long',
    isDouble = 'setting.valid.double',
    isBoolean = 'setting.valid.boolean',
    isHex = 'setting.valid.hex',
    isBase64 = 'setting.valid.base64',
    isRegex = 'setting.valid.regex',
    lenRange = 'setting.valid.len_range',
    fractionDigits = 'setting.valid.fraction_digits',
    urlImg = 'setting.valid.url_image',
    rangeLength = 'workflow.valid.range_length',
    minLength = 'workflow.valid.min_length',
    maxLength = 'workflow.valid.max_length',
    rangeNum = 'workflow.valid.range_num',
    minValue = 'workflow.valid.min_value',
    maxValue = 'workflow.valid.max_value',
}

export interface EntitySchemaValue {
    name: string;
    accessMod: ENTITY_ACCESS_MODE;
    valueType: ENTITY_DATA_VALUE_TYPE;
    type: ENTITY_TYPE;
    attributes?: Record<string, any>;
    fullIdentifier: string;
}

export type ValidatorFunction<T extends EntitySchemaValue> = (
    item: [string, any],
    entitySchema: T,
) => string | boolean;

export type RequiredValidatorFunction = (
    requiredKeys: string[],
    inputEntities: [string, any][],
) => string | boolean;

/** Verify the relevant rules of the json input fields */
const useValidate = () => {
    const { getIntlText } = useI18n();

    const validatorsMapper = useMemo(() => {
        const validStringType: ValidatorFunction<EntitySchemaValue> = (item, entitySchema) => {
            const [key, value] = item;
            const {
                minLength,
                maxLength,
                lengthRange,
                format,
                enum: enums,
            } = entitySchema.attributes || {};

            if (!isString(value)) {
                return getIntlText(ErrorIntlKey.isString, { 1: key });
            }
            if (
                isValidNumber(minLength) &&
                isValidNumber(maxLength) &&
                !isRangeLength(value as string, +minLength, +maxLength)
            ) {
                return getIntlText(ErrorIntlKey.rangeLength, {
                    1: key,
                    2: minLength,
                    3: maxLength,
                });
            }
            if (isValidNumber(minLength) && !isMinLength(value as string, +minLength)) {
                return getIntlText(ErrorIntlKey.minLength, {
                    1: key,
                    2: minLength,
                });
            }
            if (isValidNumber(maxLength) && !isMaxLength(value as string, +maxLength)) {
                return getIntlText(ErrorIntlKey.maxLength, {
                    1: key,
                    2: maxLength,
                });
            }
            if (enums && !(value in enums)) {
                return getIntlText(ErrorIntlKey.enum, {
                    1: key,
                    2: Object.keys(enums).toString(),
                });
            }
            if (lengthRange) {
                const lens = lengthRange
                    .split(',')
                    .map((n: string) => +n)
                    .filter((n: number) => !isNaN(n));

                if (lens.length && !lens.some((len: number) => isRangeLength(value, len, len))) {
                    return getIntlText(ErrorIntlKey.lenRange, {
                        1: key,
                        2: lens.join(','),
                    });
                }
            }
            if (format) {
                const [type, pattern] = format.split(':');
                switch (type) {
                    case 'HEX': {
                        if (
                            !(
                                isHexadecimal(value) &&
                                (!isValidNumber(pattern)
                                    ? true
                                    : isRangeLength(value, +pattern, +pattern))
                            )
                        ) {
                            return getIntlText(ErrorIntlKey.isHex, {
                                1: key,
                            });
                        }
                        break;
                    }
                    case 'REGEX': {
                        if (!isMatches(value, new RegExp(pattern || ''))) {
                            return getIntlText(ErrorIntlKey.isRegex, {
                                1: key,
                                2: new RegExp(pattern || ''),
                            });
                        }
                        break;
                    }
                    case 'IMAGE': {
                        if (pattern === 'BASE64' && !isBase64Image(value)) {
                            return getIntlText(ErrorIntlKey.isBase64, {
                                1: key,
                            });
                        }
                        if (pattern === 'URL' && !isUrlImage(value)) {
                            return getIntlText(ErrorIntlKey.urlImg, {
                                1: key,
                            });
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            return false;
        };
        const validLongType: ValidatorFunction<EntitySchemaValue> = (item, entitySchema) => {
            const [key, value] = item;
            const { min, max } = entitySchema.attributes || {};
            if (!isInteger(value)) {
                return getIntlText(ErrorIntlKey.isLong, { 1: key });
            }
            if (
                isValidNumber(min) &&
                isValidNumber(max) &&
                !isRangeIntValue(value as number, +min, +max)
            ) {
                return getIntlText(ErrorIntlKey.rangeLength, {
                    1: key,
                    2: min,
                    3: max,
                });
            }
            if (isValidNumber(min) && !isMinIntValue(value as number, +min)) {
                return getIntlText(ErrorIntlKey.minValue, {
                    1: key,
                    2: min,
                });
            }
            if (isValidNumber(max) && !isMaxIntValue(value as number, +max)) {
                return getIntlText(ErrorIntlKey.maxValue, {
                    1: key,
                    2: max,
                });
            }
            return false;
        };
        const validDoubleType: ValidatorFunction<EntitySchemaValue> = (item, entitySchema) => {
            const [key, value] = item;
            const { min, max, fractionDigits } = entitySchema.attributes || {};
            if (!isDouble(value)) {
                return getIntlText(ErrorIntlKey.isDouble, { 1: key });
            }
            if (
                isValidNumber(min) &&
                isValidNumber(max) &&
                !isRangeValue(value as number, +min, +max)
            ) {
                return getIntlText(ErrorIntlKey.rangeLength, {
                    1: key,
                    2: min,
                    3: max,
                });
            }
            if (isValidNumber(min) && !isMinValue(value as number, +min)) {
                return getIntlText(ErrorIntlKey.minValue, {
                    1: key,
                    2: min,
                });
            }
            if (isValidNumber(max) && !isMaxValue(value as number, +max)) {
                return getIntlText(ErrorIntlKey.maxValue, {
                    1: key,
                    2: max,
                });
            }
            if (isValidNumber(fractionDigits) && !isFractionDigits(value, fractionDigits)) {
                return getIntlText(ErrorIntlKey.fractionDigits, {
                    1: key,
                    2: fractionDigits,
                });
            }
            return false;
        };
        const validBooleanType: ValidatorFunction<EntitySchemaValue> = (item, entitySchema) => {
            const [key, value] = item;
            if (!isBoolean(value)) {
                return getIntlText(ErrorIntlKey.isBoolean, { 1: key });
            }
            return false;
        };
        const validRequired: RequiredValidatorFunction = (requiredKeys, inputEntities) => {
            const requiredKey = requiredKeys.find((requiredKey: string) => {
                return !inputEntities.some(([key]: [string, any]) => {
                    return requiredKey === key;
                });
            });
            return requiredKey ? getIntlText(ErrorIntlKey.required, { 1: requiredKey }) : false;
        };

        return {
            getValidFunc: (validatorType: string) => {
                const validFuncMap: Record<
                    string,
                    ValidatorFunction<EntitySchemaValue> | RequiredValidatorFunction
                > = {
                    string: validStringType,
                    long: validLongType,
                    double: validDoubleType,
                    boolean: validBooleanType,
                    required: validRequired,
                };
                return validFuncMap[validatorType as keyof typeof validFuncMap] || (() => false);
            },
        };
    }, [getIntlText]);

    return {
        validatorsMapper,
    };
};

export default useValidate;
