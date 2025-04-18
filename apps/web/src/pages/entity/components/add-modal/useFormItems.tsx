import { useMemo } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextField, FormControl, FormHelperText } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Select } from '@milesight/shared/src/components';
import {
    checkRequired,
    checkNumber,
    checkMaxLength,
    isMaxLength,
} from '@milesight/shared/src/utils/validators';
import { ENTITY_ACCESS_MODE, entityTypeOptions } from '@/constants';
import { BooleanInput, DataTypeRadio, type DataTypeRadioProps, EnumsInput } from './components';

type ExtendControllerProps<T extends FieldValues> = ControllerProps<T> & {
    /**
     * To Control whether the current component is rendered
     */
    shouldRender?: (data: Partial<T>) => boolean;
};

/**
 * Form data type
 */
export type FormDataProps = {
    name: string;
    identifier: string;
    accessMod: EntityAccessMode;
    valueType: EntityValueDataType;
    dataType?: DataTypeRadioProps['value'];
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    boolEnums?: Record<string, string>;
    enums?: Record<string, string>;
    /** unit */
    unit?: string;
};

const useFormItems = () => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ExtendControllerProps<FormDataProps>[] = [];

        result.push(
            {
                name: 'name',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 25 }),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('device.label.param_entity_name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'identifier',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 50 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            disabled={disabled}
                            label={getIntlText('common.label.key')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'accessMod',
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <Select
                            required
                            fullWidth
                            error={error}
                            disabled={disabled}
                            label={getIntlText('entity.label.entity_type_of_access')}
                            options={[
                                {
                                    label: getIntlText(
                                        'entity.label.entity_type_of_access_readonly',
                                    ),
                                    value: ENTITY_ACCESS_MODE.R,
                                },
                                {
                                    label: getIntlText('entity.label.entity_type_of_access_write'),
                                    value: ENTITY_ACCESS_MODE.W,
                                },
                                {
                                    label: getIntlText(
                                        'entity.label.entity_type_of_access_read_and_write',
                                    ),
                                    value: ENTITY_ACCESS_MODE.RW,
                                },
                            ]}
                            formControlProps={{
                                sx: { my: 1.5 },
                            }}
                            value={(value as FormDataProps['accessMod']) || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'valueType',
                rules: {
                    validate: { checkRequired: checkRequired() },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <Select
                            required
                            fullWidth
                            error={error}
                            disabled={disabled}
                            label={getIntlText('common.label.data_type')}
                            options={entityTypeOptions.map(item => {
                                return {
                                    label: getIntlText(item.label),
                                    value: item.value,
                                };
                            })}
                            formControlProps={{
                                error: !!error,
                                sx: { my: 1.5 },
                            }}
                            value={(value as FormDataProps['valueType']) || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'dataType',
                render({ field: { onChange, value, disabled } }) {
                    return (
                        <DataTypeRadio
                            disabled={disabled}
                            value={(value as FormDataProps['dataType']) || 'value'}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return data.valueType === 'LONG' || data.valueType === 'STRING';
                },
            },
            {
                name: 'min',
                rules: {
                    validate: { checkRequired: checkRequired(), checkNumber: checkNumber() },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('entity.label.entity_minimum_value')}
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return (
                        data.valueType === 'DOUBLE' ||
                        (data.valueType === 'LONG' && data.dataType === 'value')
                    );
                },
            },
            {
                name: 'max',
                rules: {
                    validate: { checkRequired: checkRequired(), checkNumber: checkNumber() },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('entity.label.entity_maximum_value')}
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return (
                        data.valueType === 'DOUBLE' ||
                        (data.valueType === 'LONG' && data.dataType === 'value')
                    );
                },
            },
            {
                name: 'minLength',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkNumber: checkNumber(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('entity.label.entity_minimum_length')}
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return data.valueType === 'STRING' && data.dataType === 'value';
                },
            },
            {
                name: 'maxLength',
                rules: {
                    validate: { checkRequired: checkRequired(), checkNumber: checkNumber() },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('entity.label.entity_maximum_length')}
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return data.valueType === 'STRING' && data.dataType === 'value';
                },
            },
            {
                name: 'boolEnums',
                rules: {
                    validate: {
                        checkRequired(value) {
                            if (
                                !value ||
                                !Object.values(value).length ||
                                Object.values(value).some(item => !item)
                            ) {
                                return getIntlText('valid.input.required');
                            }
                        },
                        checkMaxLength(value) {
                            const maxLength = 25;
                            const values = Object.values(value || {});
                            let result: string | undefined;

                            if (
                                values.length &&
                                values.some(item => !isMaxLength(item, maxLength))
                            ) {
                                return getIntlText('valid.input.max_length', { 1: maxLength });
                            }

                            return result;
                        },
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth sx={{ my: 1.5 }}>
                            <BooleanInput
                                required
                                error={!!error}
                                disabled={disabled}
                                value={(value as FormDataProps['boolEnums']) || {}}
                                onChange={onChange}
                            />
                            {!!error && <FormHelperText error>{error?.message}</FormHelperText>}
                        </FormControl>
                    );
                },
                shouldRender(data) {
                    return data.valueType === 'BOOLEAN';
                },
            },
            {
                name: 'enums',
                rules: {
                    validate: {
                        checkRequired(value) {
                            const values = [
                                ...Object.keys(value || {}),
                                ...Object.values(value || {}),
                            ];
                            if (!value || !values.length || values.some(item => !item)) {
                                return getIntlText('valid.input.required');
                            }
                        },
                        checkMaxLength(value) {
                            const maxLength = 25;
                            const values = [
                                ...Object.keys(value || {}),
                                ...Object.values(value || {}),
                            ];

                            if (
                                values.length &&
                                values.some(item => !isMaxLength(item, maxLength))
                            ) {
                                return getIntlText('valid.input.max_length', { 1: maxLength });
                            }
                        },
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth sx={{ my: 1.5 }}>
                            <EnumsInput
                                required
                                error={!!error}
                                disabled={disabled}
                                value={value as FormDataProps['enums']}
                                onChange={onChange}
                            />
                            {!!error && <FormHelperText error>{error?.message}</FormHelperText>}
                        </FormControl>
                    );
                },
                shouldRender(data) {
                    return (
                        data.dataType === 'enums' &&
                        (data.valueType === 'STRING' || data.valueType === 'LONG')
                    );
                },
            },
            {
                name: 'unit',
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
                            autoComplete="off"
                            label={getIntlText('entity.label.unit')}
                            error={!!error}
                            disabled={disabled}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
                shouldRender(data) {
                    return ['STRING', 'LONG', 'DOUBLE'].includes(String(data.valueType));
                },
            },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
