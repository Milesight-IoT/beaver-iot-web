import { useMemoizedFn } from 'ahooks';
import { forIn, isArray, isObject } from 'lodash-es';
import { ENTITY_ACCESS_MODE, ENTITY_DATA_VALUE_TYPE, ENTITY_TYPE } from '@/constants';
import { EntitySchemaType, TemplateDetailType, TemplateProperty } from '@/services/http';
import useValidate, { RequiredValidatorFunction, ValidatorFunction } from './useValidate';
import {
    isValidNumber,
    randomGreaterLength,
    randomGreaterValue,
    randomHexString,
    randomImageBase64,
    randomImageUrl,
    randomInLengthRange,
    randomLessLength,
    randomLessValue,
    randomOneByArray,
    randomStringByReg,
    randomValueInRange,
} from '../utils';

type TemplatePropertyType = ObjectToCamelCase<TemplateProperty>;

export interface EntitySchemaValue {
    name: string;
    accessMod: ENTITY_ACCESS_MODE;
    valueType: ENTITY_DATA_VALUE_TYPE;
    type: ENTITY_TYPE;
    attributes: Record<string, any>;
    fullIdentifier: string;
}

export interface EntitySchemaObj {
    [key: string]: EntitySchemaValue | undefined;
}

const useTemplateData = () => {
    const { validatorsMapper } = useValidate();

    /**
     * Convert entity schema list to object
     * @param entitySchema
     * @returns EntitySchemaObj
     */
    const convertEntitySchema2Obj = (
        entitySchema: ObjectToCamelCase<EntitySchemaType[]> | undefined,
    ): EntitySchemaObj => {
        if (!entitySchema) {
            return {};
        }
        return entitySchema.reduce(
            (acc: EntitySchemaObj, entity: ObjectToCamelCase<EntitySchemaType>) => {
                if (entity.children?.length) {
                    const newAcc = convertEntitySchema2Obj(entity.children);
                    Object.assign(acc, newAcc);
                } else {
                    acc[entity.fullIdentifier] = entity;
                }
                return acc;
            },
            {} as Record<string, any>,
        );
    };

    /**
     * Collect input entity key map to entity entityMapping, eg: metrics.hum => metrics.temperature
            input json data verification will then the entitySchema rules can be associated
     * @param inputProperties 
     * @param parentKey 
     * @returns Record<string, TemplatePropertyType | undefined>
     */
    const collectInputKeyMapping = (
        inputProperties: TemplatePropertyType[] | undefined,
        parentKey: string = '',
    ): Record<string, TemplatePropertyType | undefined> => {
        if (!inputProperties) {
            return {};
        }
        return inputProperties.reduce(
            (
                acc: Record<string, TemplatePropertyType | undefined>,
                entity: TemplatePropertyType,
            ) => {
                const currentKey = parentKey ? `${parentKey}.${entity.key}` : entity.key;
                if (entity.properties?.length) {
                    const newAcc = collectInputKeyMapping(entity.properties, currentKey);
                    Object.assign(acc, newAcc);
                } else {
                    acc[currentKey] = entity;
                }
                return acc;
            },
            {} as Record<string, TemplatePropertyType | undefined>,
        );
    };

    /**
     * Convert entity schema list to object
     * @param property
     * @param entitySchema
     * @returns any
     */
    const randomValueByType = useMemoizedFn(
        (property: TemplatePropertyType, entitySchema: EntitySchemaValue | undefined): any => {
            const {
                min,
                max,
                fractionDigits,
                minLength,
                maxLength,
                lengthRange,
                format = '',
                enum: enums,
            } = entitySchema?.attributes || {};
            const [type, pattern] = format.split(':');

            switch (property.type) {
                case ENTITY_DATA_VALUE_TYPE.STRING as string: {
                    if (property.key.includes('device_id')) {
                        return `Dev00${randomValueInRange(1, 9)}`;
                    }
                    if (property?.key && entitySchema?.name === 'timestamp') {
                        return new Date().toISOString();
                    }
                    if (isValidNumber(minLength) && isValidNumber(maxLength)) {
                        return randomInLengthRange(+minLength, +maxLength);
                    }
                    if (isValidNumber(minLength)) {
                        return randomGreaterLength(+minLength);
                    }
                    if (isValidNumber(maxLength)) {
                        return randomLessLength(+maxLength);
                    }
                    if (Object.keys(enums || {})?.length) {
                        return Object.keys(enums)[randomLessValue(Object.keys(enums).length - 1)];
                    }
                    if (type === 'HEX') {
                        const lens: number[] = (lengthRange || '')
                            .split(',')
                            .map((n: string) => (isValidNumber(n) ? +n : undefined))
                            .filter((n: number) => !isNaN(n));
                        return randomHexString(randomOneByArray(lens) || 12);
                    }
                    if (type === 'REGEX') {
                        return randomStringByReg(pattern);
                    }
                    if (type === 'IMAGE') {
                        if (pattern === 'BASE64') {
                            return randomImageBase64();
                        }
                        if (pattern === 'URL') {
                            return randomImageUrl();
                        }
                        return '';
                    }
                    return randomInLengthRange(3, 3);
                }
                case ENTITY_DATA_VALUE_TYPE.LONG as string: {
                    if (isValidNumber(min) && isValidNumber(max)) {
                        return randomValueInRange(+min, +max);
                    }
                    if (isValidNumber(min)) {
                        return randomGreaterValue(+min);
                    }
                    if (isValidNumber(max)) {
                        return randomLessValue(+max);
                    }
                    if (Object.keys(enums || {})?.length) {
                        const randomKey =
                            Object.keys(enums)[randomLessValue(Object.keys(enums).length - 1)];
                        return isValidNumber(randomKey) ? Number(randomKey) : randomKey;
                    }
                    return randomValueInRange(10, 60);
                }
                case ENTITY_DATA_VALUE_TYPE.DOUBLE as string: {
                    if (isValidNumber(min) && isValidNumber(max)) {
                        return randomValueInRange(+min, +max, fractionDigits);
                    }
                    if (isValidNumber(min)) {
                        return randomGreaterValue(+min, fractionDigits);
                    }
                    if (isValidNumber(max)) {
                        return randomLessValue(+max, fractionDigits);
                    }
                    return randomValueInRange(10, 60, fractionDigits);
                }
                case ENTITY_DATA_VALUE_TYPE.BOOLEAN as string: {
                    const filterNotBoolKey = Object.keys(enums || {}).filter(
                        v => !['true', 'false'].includes(v),
                    );
                    if (filterNotBoolKey.length) {
                        return Boolean(
                            filterNotBoolKey[randomLessValue(filterNotBoolKey.length - 1)],
                        );
                    }
                    return Math.random() < 0.5;
                }
                default: {
                    break;
                }
            }
            return randomGreaterLength(3);
        },
    );

    /**
     * Random json by property and schema
     * @param inputProperties
     * @param entitySchemaObj
     * @returns Record<string, any>
     */
    const randomJsonByProperties = (
        inputProperties: TemplatePropertyType[] | undefined,
        entitySchemaObj: EntitySchemaObj,
    ): Record<string, any> => {
        if (!inputProperties) {
            return {};
        }
        return inputProperties.reduce(
            (acc: Record<string, any>, property: TemplatePropertyType) => {
                if (property.properties?.length) {
                    acc[property.key] = randomJsonByProperties(
                        property.properties,
                        entitySchemaObj,
                    );
                } else {
                    acc[property.key] = randomValueByType(
                        property,
                        entitySchemaObj[property.entityMapping || property.key],
                    );
                }
                return acc;
            },
            {} as Record<string, any>,
        );
    };

    /**
     * Random input json by inputSchema and entitySchema
     * @param template
     * @returns  Record<string, any>
     */
    const randomJsonByInputSchema = (
        template: ObjectToCamelCase<TemplateDetailType> | undefined,
    ): Record<string, any> => {
        const entitySchemaObj = convertEntitySchema2Obj(template?.entitySchema);
        const inputParams = randomJsonByProperties(
            template?.inputSchema?.properties,
            entitySchemaObj,
        );
        return inputParams;
    };

    /**
     * Valid json format
     * @param inputData
     * @param templateDetail
     * @returns string (errorMessage) | boolean
     */
    const checkInputJsonFormat = (
        inputData: Record<string, any>,
        templateDetail: ObjectToCamelCase<TemplateDetailType> | undefined,
    ): string | boolean => {
        const inputKeyMapping = collectInputKeyMapping(templateDetail?.inputSchema.properties);
        const entitySchemaObj = convertEntitySchema2Obj(templateDetail?.entitySchema);
        const inputEntity = transformInputDataToArray(inputData);
        return (
            checkRequiredByInputSchema(inputEntity, inputKeyMapping) ||
            checkValueByEntitySchema(inputEntity, inputKeyMapping, entitySchemaObj)
        );
    };

    /**
     * Transform InputData to flatten list
     * @param inputData
     * @param parentKey
     * @param result
     * @returns [string, any][]
     */
    const transformInputDataToArray = (
        inputData: Record<string, any>,
        parentKey: string = '',
        result: [string, any][] = [],
    ): [string, any][] => {
        forIn(inputData, (value, key) => {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            if (isObject(value) && !isArray(value)) {
                transformInputDataToArray(value, newKey, result);
            } else {
                result.push([newKey, value]);
            }
        });
        return result;
    };

    /**
     * Check input value by entitySchema
     * @param inputEntity
     * @param inputKeyMapping
     * @param entitySchemaObj
     * @returns string (errorMessage) | boolean
     */
    const checkValueByEntitySchema = (
        inputEntity: [string, any][],
        inputKeyMapping: Record<string, TemplatePropertyType | undefined>,
        entitySchemaObj: EntitySchemaObj,
    ): string | boolean => {
        let errorMessage: boolean | string = false;
        inputEntity.some((item: [string, any]) => {
            const entitySchema = entitySchemaObj?.[inputKeyMapping?.[item[0]]?.entityMapping || ''];
            if (entitySchema) {
                errorMessage = (
                    validatorsMapper.getValidFunc(
                        entitySchema?.valueType?.toLowerCase(),
                    ) as ValidatorFunction<EntitySchemaValue>
                )(item, entitySchema);
                return !!errorMessage;
            }
            return false;
        });
        return errorMessage;
    };

    /**
     * Check input field required
     * @param inputEntity
     * @param inputKeyMapping
     * @returns string (errorMessage) | boolean
     */
    const checkRequiredByInputSchema = (
        inputEntity: [string, any][],
        inputKeyMapping: Record<string, TemplatePropertyType | undefined>,
    ): string | boolean => {
        return (validatorsMapper.getValidFunc('required') as RequiredValidatorFunction)(
            Object.keys(inputKeyMapping).filter((key: string) => {
                return inputKeyMapping[key]?.required;
            }),
            inputEntity,
        );
    };

    return {
        randomJsonByInputSchema,
        checkInputJsonFormat,
    };
};

export default useTemplateData;
