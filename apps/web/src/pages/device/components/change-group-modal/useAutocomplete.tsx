import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { type FieldError } from 'react-hook-form';
import { type UseAutocompleteProps, type AutocompleteProps, TextField } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';

import useDeviceStore from '../../store';

export function useAutocomplete() {
    const { getIntlText } = useI18n();
    const { deviceGroups } = useDeviceStore();

    const options = useMemo((): OptionsProps[] => {
        return (deviceGroups || []).map(d => ({
            label: d.name,
            value: d.id,
        }));
    }, [deviceGroups]);

    const handleTransformValue = useMemoizedFn((value: ApiKey) => {
        return (
            options.find(option => {
                if (!value) {
                    return false;
                }

                return value === option.value;
            }) || null
        );
    });

    const handleChange = useMemoizedFn(
        (
            onChange: (...event: any[]) => void,
        ): UseAutocompleteProps<OptionsProps, false, false, false>['onChange'] => {
            return (_, selectedOption) => {
                onChange(selectedOption?.value || null);
            };
        },
    );

    const handleRenderInput = useMemoizedFn(
        (
            text: string,
            error: FieldError | undefined,
        ): AutocompleteProps<OptionsProps, false, false, false>['renderInput'] => {
            return params => {
                return (
                    <TextField
                        {...params}
                        required
                        error={!!error}
                        helperText={error ? error.message : null}
                        label={text}
                        placeholder={getIntlText('common.placeholder.select')}
                    />
                );
            };
        },
    );

    const handleIsOptionEqualToValue = useMemoizedFn(
        (): UseAutocompleteProps<OptionsProps, false, false, false>['isOptionEqualToValue'] => {
            return (option, valueObj) => option.value === valueObj.value;
        },
    );

    return {
        options,
        handleTransformValue,
        handleChange,
        handleRenderInput,
        handleIsOptionEqualToValue,
    };
}
