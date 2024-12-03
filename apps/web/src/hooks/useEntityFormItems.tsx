import { useMemo, useCallback } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    TextField,
    FormControl,
    // FormLabel,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Switch,
} from '@mui/material';
import { isNil } from 'lodash-es';
import {
    checkRequired,
    checkMinValue,
    checkMaxValue,
    checkRangeValue,
    checkMinLength,
    checkMaxLength,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { type IntegrationAPISchema } from '@/services/http';

interface Props {
    entities?: ObjectToCamelCase<
        IntegrationAPISchema['getDetail']['response']['integration_entities']
    >;

    /**
     * 是否全部必填
     */
    isAllRequired?: boolean;
}

/**
 * 表单数据类型
 */
export type EntityFormDataProps = Record<string, any>;

/**
 * 获取实体校验规则
 */
const getValidators = (entity: NonNullable<Props['entities']>[0], required = false) => {
    const result: NonNullable<ControllerProps<EntityFormDataProps>['rules']>['validate'] = {};
    const attr = entity.valueAttribute || {};
    const isValidNumber = (num: any): num is number => !isNil(num) && !isNaN(+num);

    if (required && entity.valueType !== 'BOOLEAN') {
        result.checkRequired = checkRequired();
    }

    if (isValidNumber(attr.min) && isValidNumber(attr.max)) {
        result.checkRangeValue = checkRangeValue({ min: attr.min, max: attr.max });
    } else if (isValidNumber(attr.min)) {
        result.checkMinValue = checkMinValue({ min: attr.min });
    } else if (isValidNumber(attr.max)) {
        result.checkMaxValue = checkMaxValue({ max: attr.max });
    }

    if (isValidNumber(attr.minLength) && isValidNumber(attr.maxLength)) {
        result.checkRangeLength = checkRangeLength({ min: attr.minLength, max: attr.maxLength });
    } else if (isValidNumber(attr.minLength)) {
        result.checkMinLength = checkMinLength({ min: attr.minLength });
    } else if (isValidNumber(attr.maxLength)) {
        result.checkMaxLength = checkMaxLength({ max: attr.maxLength });
    }

    return result;
};

/**
 * 实体动态表单项
 */
const useEntityFormItems = ({ entities, isAllRequired = false }: Props) => {
    /**
     * 实体 Key & 表单 Key 映射表
     * { [entityKey]: [formKey] }
     */
    const encodedEntityKeys = useMemo(() => {
        const result: Record<string, string> = {};

        entities?.forEach(entity => {
            result[entity.key] = `${entity.key}`.replace(/\./g, '$');
        });

        return result;
    }, [entities]);

    const decodeEntityKey = useCallback(
        (key: string) => {
            const data = Object.entries(encodedEntityKeys).find(([_, value]) => value === key);
            return data?.[0];
        },
        [encodedEntityKeys],
    );

    const decodeFormParams = useCallback(
        (data: Record<string, any>) => {
            const result: Record<string, any> = {};

            Object.entries(data).forEach(([key, value]) => {
                const entityKey = decodeEntityKey(key);
                entityKey && (result[entityKey] = value);
            });

            return result;
        },
        [decodeEntityKey],
    );

    const encodeFormData = useCallback(
        (entities: Props['entities']) => {
            const result = entities?.reduce(
                (acc, item) => {
                    const key = encodedEntityKeys[item.key];

                    key && (acc[key] = item.value);
                    return acc;
                },
                {} as Record<string, any>,
            );

            return result;
        },
        [encodedEntityKeys],
    );

    const formItems = useMemo(() => {
        const result: ControllerProps<EntityFormDataProps>[] = [];

        if (!entities?.length) return result;

        entities?.forEach(entity => {
            const attr = entity.valueAttribute || {};
            const validate = getValidators(entity, isAllRequired);

            // OBJECT 类型为「分组」，暂不做处理
            switch (entity.valueType) {
                case 'LONG':
                case 'DOUBLE':
                case 'STRING': {
                    const formItem: ControllerProps<EntityFormDataProps> = {
                        name: encodedEntityKeys[entity.key],
                        rules: { validate },
                        defaultValue: '',
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <TextField
                                    fullWidth
                                    type="text"
                                    sx={{ my: 1.5 }}
                                    required={isAllRequired}
                                    disabled={disabled}
                                    label={entity.name}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        },
                    };

                    // 如果是枚举类型，则渲染下拉框
                    if (attr.enum) {
                        formItem.defaultValue = '';
                        formItem.render = ({
                            field: { onChange, value, disabled },
                            fieldState: { error },
                        }) => {
                            return (
                                <FormControl
                                    disabled={disabled}
                                    fullWidth
                                    size="small"
                                    sx={{ my: 1.5 }}
                                >
                                    <InputLabel
                                        required={isAllRequired}
                                        id={`select-label-${entity.name}`}
                                        error={!!error}
                                    >
                                        {entity.name}
                                    </InputLabel>
                                    <Select
                                        notched
                                        label={entity.name}
                                        labelId={`select-label-${entity.name}`}
                                        required={isAllRequired}
                                        error={!!error}
                                        value={value}
                                        onChange={onChange}
                                    >
                                        {Object.entries(attr.enum || {}).map(([key, value]) => (
                                            <MenuItem key={value} value={key}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {!!error && (
                                        <FormHelperText error>{error.message}</FormHelperText>
                                    )}
                                </FormControl>
                            );
                        };
                    }

                    result.push(formItem);
                    break;
                }
                case 'BOOLEAN': {
                    result.push({
                        name: encodedEntityKeys[entity.key],
                        rules: { validate },
                        defaultValue: false,
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <FormControl
                                    fullWidth
                                    error={!!error}
                                    disabled={disabled}
                                    size="small"
                                    sx={{ my: 1.5 }}
                                >
                                    <FormControlLabel
                                        label={entity.name}
                                        required={isAllRequired}
                                        checked={!!value}
                                        onChange={onChange}
                                        control={<Switch size="small" />}
                                        sx={{ fontSize: '12px' }}
                                    />
                                    {!!error && (
                                        <FormHelperText error>{error.message}</FormHelperText>
                                    )}
                                </FormControl>
                            );
                        },
                    });
                    break;
                }
                case 'BINARY': {
                    result.push({
                        name: encodedEntityKeys[entity.key],
                        rules: { validate },
                        defaultValue: '',
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <TextField
                                    fullWidth
                                    multiline
                                    type="text"
                                    rows={4}
                                    required={isAllRequired}
                                    disabled={disabled}
                                    label={entity.name}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        },
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });

        return result;
    }, [entities, isAllRequired, encodedEntityKeys]);

    return {
        formItems,

        /**
         * 对实体 key 进行解码
         */
        decodeEntityKey,

        /**
         * 对表单参数进行解码
         */
        decodeFormParams,

        /**
         * 将实体数据编码为表单数据
         */
        encodeFormData,
    };
};

export default useEntityFormItems;
