import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { isEqual } from 'lodash-es';
import { TextField, FormControl, FormHelperText, Autocomplete } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired, checkMaxLength } from '@milesight/shared/src/utils/validators';

import { type IntegrationAPISchema } from '@/services/http';
import { useEntityFormItems } from '@/hooks';
import LocationInput from '../location-input';
import useDeviceStore from '../../store';

interface Props {
    entities?: ObjectToCamelCase<
        IntegrationAPISchema['getDetail']['response']['integration_entities']
    >;
}

/**
 * Form data type
 */
export type FormDataProps = Record<string, any>;

/**
 * Add a device dynamic list entry
 */
const useDynamicFormItems = ({ entities }: Props) => {
    const { getIntlText } = useI18n();
    const { formItems: entityFormItems, decodeFormParams } = useEntityFormItems({
        entities,
        // isAllRequired: true,
    });
    const { deviceGroups } = useDeviceStore();

    const formItems = useMemo(() => {
        if (!entityFormItems?.length) return [];

        const prefixItems: ControllerProps<FormDataProps>[] = [
            {
                name: 'name',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkMaxLength: checkMaxLength({ max: 64 }),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            label={getIntlText('common.label.name')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        ];

        const suffixItems: ControllerProps<FormDataProps>[] = [
            {
                name: 'group',
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    const options = (deviceGroups || []).map(d => ({
                        label: d.name,
                        value: d.name,
                    }));

                    const innerValue = options.find(item => item.value === value);

                    return (
                        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                            <Autocomplete
                                options={options}
                                isOptionEqualToValue={(option, value) => isEqual(option, value)}
                                getOptionKey={option => option.value}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={getIntlText('device.label.device_group')}
                                        error={!!error}
                                    />
                                )}
                                value={innerValue || null}
                                onChange={(_, option) => onChange(option?.value || null)}
                                ListboxProps={{
                                    sx: {
                                        height: '240px',
                                    },
                                }}
                            />
                            {!!error && <FormHelperText error>{error.message}</FormHelperText>}
                        </FormControl>
                    );
                },
            },
            {
                name: 'location',
                defaultValue: {},
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <LocationInput
                            fullWidth
                            label={getIntlText('common.label.location')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        ];

        return [...prefixItems, ...entityFormItems, ...suffixItems];
    }, [entityFormItems, getIntlText, deviceGroups]);

    return { formItems, decodeFormParams };
};

export default useDynamicFormItems;
