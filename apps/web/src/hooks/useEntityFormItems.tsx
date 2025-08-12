import { useMemo, useCallback } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    TextField,
    FormControl,
    // FormLabel,
    FormControlLabel,
    InputLabel,
    // Select,
    // MenuItem,
    FormHelperText,
    Switch,
    Autocomplete,
} from '@mui/material';
import { isNil, isEqual } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    checkRequired,
    checkMinValue,
    checkMaxValue,
    checkRangeValue,
    checkLength,
    checkMinLength,
    checkMaxLength,
    checkRangeLength,
    checkRegexp,
    checkHexNumber,
    checkNumber,
    checkDecimals,
    checkStartWithHttpOrHttps,
} from '@milesight/shared/src/utils/validators';
import { InfoOutlinedIcon } from '@milesight/shared/src/components';
import ImageInput, { type Props as ImageInputProps } from '@/components/image-input';
import Tooltip from '@/components/tooltip';
import { type IntegrationAPISchema } from '@/services/http';

export interface Props {
    entities?: ObjectToCamelCase<
        IntegrationAPISchema['getDetail']['response']['integration_entities']
    >;

    /**
     * Whether all is required
     * @deprecated
     */
    isAllRequired?: boolean;

    /**
     * Whether all is read-only
     */
    isAllReadOnly?: boolean;

    /**
     * The props of image input component
     */
    imageUploadProps?: Omit<ImageInputProps, 'value' | 'onChange'>;
}

/**
 * Form data type
 */
export type EntityFormDataProps = Record<string, any>;

/**
 * This keyword in format field indicates that this entity will be rendered as an image input
 */
export const IMAGE_ENTITY_KEYWORD = 'IMAGE';

/**
 * Gets entity verification rules
 */
const getValidators = (entity: NonNullable<Props['entities']>[0], required = false) => {
    const result: NonNullable<ControllerProps<EntityFormDataProps>['rules']>['validate'] = {};
    const attr = entity.valueAttribute || {};
    const isValidNumber = (num: any): num is number => !isNil(num) && !isNaN(+num);

    // Check required
    if (required && entity.valueType !== 'BOOLEAN') {
        result.checkRequired = checkRequired();
    }

    // Check value type
    switch (entity.valueType) {
        case 'LONG': {
            result.checkNumber = checkNumber();
            break;
        }
        case 'DOUBLE': {
            result.checkDecimals = checkDecimals({});
            break;
        }
        default: {
            break;
        }
    }

    // Check min/max value
    if (isValidNumber(attr.min) && isValidNumber(attr.max)) {
        result.checkRangeValue = checkRangeValue({ min: attr.min, max: attr.max });
    } else if (isValidNumber(attr.min)) {
        result.checkMinValue = checkMinValue({ min: attr.min });
    } else if (isValidNumber(attr.max)) {
        result.checkMaxValue = checkMaxValue({ max: attr.max });
    }

    // Check min/max length
    if (isValidNumber(attr.minLength) && isValidNumber(attr.maxLength)) {
        result.checkRangeLength = checkRangeLength({ min: attr.minLength, max: attr.maxLength });
    } else if (isValidNumber(attr.minLength)) {
        result.checkMinLength = checkMinLength({ min: attr.minLength });
    } else if (isValidNumber(attr.maxLength)) {
        result.checkMaxLength = checkMaxLength({ max: attr.maxLength });
    }

    // Check length range
    if (attr.lengthRange) {
        const lens = attr.lengthRange
            .split(',')
            .map(item => +item)
            .filter(item => !isNaN(item));

        if (lens.length) {
            result.checkLength = checkLength({ enum: lens });
        }
    }

    // Check format
    if (attr.format) {
        if (attr.format.startsWith('REGEX:')) {
            const [, pattern] = attr.format.split(':');
            result.checkRegexp = checkRegexp({ regexp: new RegExp(pattern || '') });
        }

        switch (attr.format) {
            case 'HEX': {
                result.checkHexNumber = checkHexNumber();
                break;
            }
            case 'IMAGE':
            case 'IMAGE:URL': {
                result.checkStartWithHttpOrHttps = checkStartWithHttpOrHttps();
                break;
            }
            default: {
                break;
            }
        }
    }

    return result;
};

/**
 * Entity dynamic form entry
 */
const useEntityFormItems = ({ entities, isAllReadOnly, imageUploadProps }: Props) => {
    const { getIntlText } = useI18n();

    /**
     * Entity Key & Form Key mapping table
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
        const renderLabel = (label?: string, helperText?: string) => {
            if (!helperText) return label;

            return (
                <>
                    {label}
                    <Tooltip className="ms-form-label-help" title={helperText}>
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                    </Tooltip>
                </>
            );
        };

        if (!entities?.length) return result;

        entities?.forEach(entity => {
            const attr = entity.valueAttribute || {};
            const validate = getValidators(entity, !attr.optional);

            // OBJECT is of Group type and no action is required
            switch (entity.valueType) {
                case 'LONG':
                case 'DOUBLE':
                case 'STRING': {
                    const formItem: ControllerProps<EntityFormDataProps> = {
                        name: encodedEntityKeys[entity.key],
                        rules: { validate },
                        defaultValue: attr.defaultValue || '',
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <TextField
                                    fullWidth
                                    type="text"
                                    sx={{ my: 1.5 }}
                                    slotProps={{
                                        input: {
                                            readOnly: !!isAllReadOnly,
                                        },
                                    }}
                                    required={!attr.optional}
                                    disabled={disabled}
                                    label={renderLabel(entity.name, entity.description)}
                                    error={!!error}
                                    helperText={error ? error.message : null}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        },
                    };

                    // If it is an enumeration type, rendered as drop-down box
                    if (attr.enum) {
                        // formItem.defaultValue = '';
                        formItem.render = ({
                            field: { onChange, value, disabled },
                            fieldState: { error },
                        }) => {
                            const options = Object.entries(attr.enum || {}).map(([key, value]) => ({
                                label: value,
                                value: key,
                            }));
                            const innerValue = options.find(item => item.value === value);
                            return (
                                <FormControl
                                    disabled={disabled}
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 1.5 }}
                                >
                                    <Autocomplete
                                        options={options}
                                        isOptionEqualToValue={(option, value) =>
                                            isEqual(option, value)
                                        }
                                        getOptionKey={option => option.value}
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label={renderLabel(entity.name, entity.description)}
                                                error={!!error}
                                                required={!attr.optional}
                                                placeholder={getIntlText(
                                                    'common.placeholder.select',
                                                )}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    size: 'medium',
                                                    readOnly: !!isAllReadOnly,
                                                }}
                                            />
                                        )}
                                        value={innerValue || null}
                                        onChange={(_, option) => onChange(option?.value)}
                                    />
                                    {!!error && (
                                        <FormHelperText error>{error.message}</FormHelperText>
                                    )}
                                </FormControl>
                            );
                        };
                    }

                    // If it is an image type, rendered as image input
                    if (attr.format?.includes(IMAGE_ENTITY_KEYWORD)) {
                        formItem.render = ({
                            field: { onChange, value, disabled },
                            fieldState: { error },
                        }) => (
                            <FormControl
                                required
                                disabled
                                fullWidth
                                className={error ? 'Mui-error' : ''}
                            >
                                <InputLabel>
                                    {renderLabel(entity.name, entity.description)}
                                </InputLabel>
                                <ImageInput
                                    readOnly={disabled || !!isAllReadOnly}
                                    {...imageUploadProps}
                                    value={value}
                                    onChange={onChange}
                                />
                                {error && (
                                    <FormHelperText error sx={{ mt: 1 }}>
                                        {error.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        );
                    }

                    result.push(formItem);
                    break;
                }
                case 'BOOLEAN': {
                    result.push({
                        name: encodedEntityKeys[entity.key],
                        rules: { validate },
                        defaultValue: attr.defaultValue === 'true',
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
                                        label={renderLabel(entity.name, entity.description)}
                                        required={!attr.optional}
                                        checked={!!value}
                                        onChange={onChange}
                                        control={<Switch size="small" readOnly={!!isAllReadOnly} />}
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
                        defaultValue: attr.defaultValue || '',
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <TextField
                                    fullWidth
                                    multiline
                                    type="text"
                                    rows={4}
                                    slotProps={{
                                        input: {
                                            readOnly: !!isAllReadOnly,
                                        },
                                    }}
                                    required={!attr.optional}
                                    disabled={disabled}
                                    label={renderLabel(entity.name, entity.description)}
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
    }, [entities, isAllReadOnly, imageUploadProps, encodedEntityKeys, getIntlText]);

    return {
        formItems,

        /**
         * Encoded entity keys
         */
        encodedEntityKeys,

        /**
         * Decode the entity key
         */
        decodeEntityKey,

        /**
         * Decode the form parameters
         */
        decodeFormParams,

        /**
         * Encode entity data into form data
         */
        encodeFormData,
    };
};

export default useEntityFormItems;
