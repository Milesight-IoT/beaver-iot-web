import { useMemo } from 'react';
import { TextField } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    checkRequired,
    checkRangeValue,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { type LocationType } from '@/services/http';

/**
 * Location form items
 */
const useLocationFormItems = () => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ControllerProps<LocationType>[] = [
            {
                name: 'longitude',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkRangeValue: checkRangeValue({ min: -180, max: 180 }),
                        checkRangeLength: checkRangeLength({ min: 1, max: 64 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            sx={{ my: 1.5 }}
                            disabled={disabled}
                            label={getIntlText('common.label.longitude')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'latitude',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkRangeValue: checkRangeValue({ min: -90, max: 90 }),
                        checkRangeLength: checkRangeLength({ min: 1, max: 64 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            sx={{ my: 1.5 }}
                            disabled={disabled}
                            label={getIntlText('common.label.latitude')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
            {
                name: 'address',
                rules: {
                    validate: {
                        checkRangeLength: checkRangeLength({ min: 1, max: 255 }),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            fullWidth
                            type="text"
                            autoComplete="off"
                            sx={{ my: 1.5 }}
                            disabled={disabled}
                            label={getIntlText('common.label.address')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value || ''}
                            onChange={onChange}
                        />
                    );
                },
            },
        ];

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useLocationFormItems;
