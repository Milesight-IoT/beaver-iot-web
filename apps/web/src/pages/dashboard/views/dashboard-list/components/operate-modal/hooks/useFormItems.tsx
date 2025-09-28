import { useMemo } from 'react';
import { TextField } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';

import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';

import CoverSelection from '../../cover-selection';
import { type OperateDashboardProps } from '../index';
import useDashboardListStore from '../../../store';
import { getDefaultImg } from '../../../utils';

export function useFormItems() {
    const { getIntlText } = useI18n();
    const { coverImages } = useDashboardListStore();

    const formItems = useMemo((): (ControllerProps<OperateDashboardProps> & {
        wrapCol: number;
    })[] => {
        return [
            {
                name: 'name',
                rules: {
                    maxLength: {
                        value: 64,
                        message: getIntlText('valid.input.max_length', {
                            1: 64,
                        }),
                    },
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                wrapCol: 12,
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('dashboard.dashboard_name')}
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
                name: 'cover',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                wrapCol: 12,
                defaultValue: getDefaultImg(coverImages) || '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <CoverSelection required value={value} onChange={onChange} error={error} />
                    );
                },
            },
            {
                name: 'description',
                rules: {
                    maxLength: {
                        value: 64,
                        message: getIntlText('valid.input.max_length', {
                            1: 64,
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
    }, [getIntlText, coverImages]);

    return {
        formItems,
    };
}
