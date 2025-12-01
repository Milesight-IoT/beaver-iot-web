import { useMemo } from 'react';
import { TextField } from '@mui/material';
import { type ControllerProps } from 'react-hook-form';
import { useI18n } from '@milesight/shared/src/hooks';
import { formatPrecision } from '@milesight/shared/src/utils/tools';
import {
    checkRequired,
    checkRangeValue,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { type LocationType } from '@/services/http';
import { DEVICE_LOCATION_PRECISION } from '../constants';

interface Options {
    onBlur?: (fieldKey: keyof LocationType, value: LocationType[keyof LocationType]) => void;
    // onChange?: (fieldKey: keyof LocationType, value: LocationType[keyof LocationType]) => void;
}

/**
 * Location form items
 */
const useLocationFormItems = ({ onBlur }: Options = {}) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ControllerProps<LocationType>[] = [
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
                            onBlur={event => {
                                const value = event?.target?.value?.trim();
                                if (isNaN(+value)) return;

                                const result = !value
                                    ? ''
                                    : formatPrecision(value, {
                                          precision: DEVICE_LOCATION_PRECISION,
                                          resultType: 'string',
                                      });
                                onChange(result);
                                onBlur?.('latitude', result);
                            }}
                            onKeyUp={event => {
                                if (event.key !== 'Enter') return;

                                const value = (event?.target as HTMLInputElement)?.value?.trim();
                                if (isNaN(+value)) return;

                                const result = !value
                                    ? ''
                                    : formatPrecision(value, {
                                          precision: DEVICE_LOCATION_PRECISION,
                                          resultType: 'string',
                                      });
                                onChange(result);
                                onBlur?.('latitude', result);
                            }}
                        />
                    );
                },
            },
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
                            onBlur={event => {
                                const value = event?.target?.value?.trim();
                                if (isNaN(+value)) return;

                                const result = !value
                                    ? ''
                                    : formatPrecision(value, {
                                          precision: DEVICE_LOCATION_PRECISION,
                                          resultType: 'string',
                                      });
                                onChange(result);
                                onBlur?.('longitude', result);
                            }}
                            onKeyUp={event => {
                                if (event.key !== 'Enter') return;

                                const value = (event?.target as HTMLInputElement)?.value?.trim();
                                if (isNaN(+value)) return;

                                const result = !value
                                    ? ''
                                    : formatPrecision(value, {
                                          precision: DEVICE_LOCATION_PRECISION,
                                          resultType: 'string',
                                      });
                                onChange(result);
                                onBlur?.('longitude', result);
                            }}
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
                            onBlur={event => onChange(event?.target?.value?.trim())}
                        />
                    );
                },
            },
        ];

        return result;
    }, [onBlur, getIntlText]);

    return formItems;
};

export default useLocationFormItems;
