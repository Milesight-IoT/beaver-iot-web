import { useMemo } from 'react';
import { TextField, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';

import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import IconColorSelect from '@/components/drawing-board/plugin/components/icon-color-select';

import { type OperateTagProps } from '../index';

export function useFormItems() {
    const { getIntlText } = useI18n();
    const { getCSSVariableValue } = useTheme();

    const formItems = useMemo((): (ControllerProps<OperateTagProps> & { wrapCol: number })[] => {
        return [
            {
                name: 'name',
                rules: {
                    maxLength: {
                        value: 25,
                        message: getIntlText('valid.input.max_length', {
                            1: 25,
                        }),
                    },
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                wrapCol: 9,
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('tag.title.tag_name')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                const newValue = event?.target?.value;
                                onChange(typeof newValue === 'string' ? newValue.trim() : newValue);
                            }}
                        />
                    );
                },
            },
            {
                name: 'color',
                wrapCol: 3,
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: getCSSVariableValue('--gray-7'),
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl
                            fullWidth
                            sx={{
                                '.MuiFormControl-root': {
                                    marginBottom: 0,
                                },
                            }}
                            error={!!error}
                        >
                            <IconColorSelect
                                required
                                label={getIntlText('common.label.color')}
                                value={value}
                                onChange={onChange}
                                error={!!error}
                                defaultColors={[
                                    '#4E5969',
                                    '#7B4EFA',
                                    '#3491FA',
                                    '#26C6DA',
                                    '#1EBA62',
                                    '#C0CA33',
                                    '#F7BA1E',
                                    '#F77234',
                                    '#F13535',
                                ]}
                            />
                            <FormHelperText>{error ? error.message : null}</FormHelperText>
                        </FormControl>
                    );
                },
            },
            {
                name: 'description',
                rules: {
                    maxLength: {
                        value: 63,
                        message: getIntlText('valid.input.max_length', {
                            1: 63,
                        }),
                    },
                },
                wrapCol: 12,
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.description')}
                            placeholder={getIntlText('common.placeholder.input')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            onBlur={event => {
                                const newValue = event?.target?.value;
                                onChange(typeof newValue === 'string' ? newValue.trim() : newValue);
                            }}
                        />
                    );
                },
            },
        ];
    }, [getIntlText, getCSSVariableValue]);

    return {
        formItems,
    };
}
