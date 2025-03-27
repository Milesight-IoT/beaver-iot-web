import { useMemo, useCallback } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    TextField,
    FormControl,
    // FormLabel,
    FormControlLabel,
    // InputLabel,
    // Select,
    // MenuItem,
    FormHelperText,
    Switch,
    Autocomplete,
} from '@mui/material';
import { isNil, isEqual } from 'lodash-es';
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
     * Whether all is required
     * @deprecated
     */
    isAllRequired?: boolean;
}

/**
 * Form data type
 */
export type EntityFormDataProps = Record<string, any>;

/**
 * Gets entity verification rules
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
 * Entity dynamic form entry
 */
const useEntityFormItems = ({ entities, isAllRequired = false }: Props) => {
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
                        defaultValue: '',
                        render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                            return (
                                <TextField
                                    fullWidth
                                    type="text"
                                    sx={{ my: 1.5 }}
                                    required={!attr.optional}
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

                    // If it is an enumeration type, render the drop-down box
                    if (attr.enum) {
                        formItem.defaultValue = '';
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
                                    {/* <InputLabel
                                        required={!attr.optional}
                                        id={`select-label-${entity.name}`}
                                        error={!!error}
                                    >
                                        {entity.name}
                                    </InputLabel> */}
                                    {/* <Select
                                        notched
                                        label={entity.name}
                                        labelId={`select-label-${entity.name}`}
                                        required={!attr.optional}
                                        error={!!error}
                                        value={value}
                                        onChange={e => console.log(e)}
                                    >
                                        {Object.entries(attr.enum || {}).map(([key, value]) => (
                                            <MenuItem key={value} value={key}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Select> */}
                                    <Autocomplete
                                        options={options}
                                        isOptionEqualToValue={(option, value) =>
                                            isEqual(option, value)
                                        }
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label={entity.name}
                                                error={!!error}
                                                required={!attr.optional}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    size: 'small',
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
                                        required={!attr.optional}
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
                                    required={!attr.optional}
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
    }, [entities, encodedEntityKeys]);

    return {
        formItems,

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
