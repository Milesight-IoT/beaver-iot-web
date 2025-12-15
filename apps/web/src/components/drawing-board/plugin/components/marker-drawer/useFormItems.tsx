import { useMemo } from 'react';
import { TextField } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';

import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';

import EntitySelect from '../entity-select';
import { type OperateProps } from './EntityForm';

export function useFormItems() {
    const { getIntlText } = useI18n();

    const formItems = useMemo((): ControllerProps<OperateProps>[] => {
        return [
            {
                name: 'occupiedEntity',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <EntitySelect
                            required
                            fullWidth
                            label={getIntlText('dashboard.title.occupied_state_entity')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value as EntityOptionType}
                            onChange={onChange}
                            entityType={['PROPERTY']}
                            entityAccessMod={['RW', 'R']}
                            entityValueType={['BOOLEAN']}
                        />
                    );
                },
            },
            {
                name: 'statusEntity',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <EntitySelect
                            required
                            fullWidth
                            label={getIntlText('dashboard.title.online_or_offline_entity')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value as EntityOptionType}
                            onChange={onChange}
                            entityType={['PROPERTY']}
                            entityAccessMod={['RW', 'R']}
                            entityValueType={['STRING']}
                        />
                    );
                },
            },
            {
                name: 'notification',
                rules: {
                    maxLength: {
                        value: 600,
                        message: getIntlText('valid.input.max_length', {
                            1: 600,
                        }),
                    },
                    validate: {
                        checkRequired: checkRequired(),
                        validator: val => {
                            try {
                                const trimmedVal = typeof val === 'string' ? val.trim() : undefined;
                                if (!trimmedVal) {
                                    return getIntlText(
                                        'error.http.binding_list_notification_json_invalid',
                                    );
                                }

                                const jsonVal = JSON.parse(trimmedVal);
                                if (!Array.isArray(jsonVal)) {
                                    return getIntlText(
                                        'error.http.binding_list_notification_json_invalid',
                                    );
                                }

                                if (jsonVal.some(item => typeof item !== 'object')) {
                                    return getIntlText(
                                        'error.http.binding_list_notification_json_invalid',
                                    );
                                }

                                if (jsonVal.length === 0 || jsonVal.length > 2) {
                                    return getIntlText(
                                        'error.http.binding_list_notification_array_items_length_invalid',
                                    );
                                }

                                if (
                                    jsonVal.some(
                                        item =>
                                            !['name', 'status', 'battery'].every(key => {
                                                const val = item?.[key];
                                                if (!val) {
                                                    return false;
                                                }

                                                if (typeof val !== 'string') {
                                                    return false;
                                                }

                                                return !!val.trim();
                                            }),
                                    )
                                ) {
                                    return getIntlText(
                                        'error.http.binding_list_notification_key_or_value_incomplete',
                                    );
                                }

                                return true;
                            } catch {
                                return getIntlText(
                                    'error.http.binding_list_notification_json_invalid',
                                );
                            }
                        },
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            multiline
                            rows={14}
                            label={getIntlText('common.label.notification')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                const newValue = event?.target?.value;
                                onChange(typeof newValue === 'string' ? newValue.trim() : newValue);
                            }}
                            sx={{
                                '.MuiInputBase-root.MuiOutlinedInput-root': {
                                    padding: '0 0 0 12px',
                                },
                            }}
                        />
                    );
                },
            },
        ];
    }, [getIntlText]);

    return {
        formItems,
    };
}
