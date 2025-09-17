import { useCallback, useMemo, useState } from 'react';
import {
    Autocomplete,
    AutocompleteInputChangeReason,
    AutocompleteProps,
    Box,
    TextField,
} from '@mui/material';
import { isArray, isEqual } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { SelectValueOptionType } from '../../../../../../types';
import { AutocompletePropsOverrides, ValueSelectInnerProps, ValueSelectProps } from '../../types';
import { useOptions, useSelectedValue } from './hooks';
import { VirtualSelect } from './components';

/**
 *  A drop-down selection component for advanced filter
 */
const ValueSelect = <
    V extends SelectValueOptionType,
    M extends boolean | undefined = false,
    D extends boolean | undefined = false,
>({
    value,
    onChange,
    multiple,
    onOpen,
    onClose,
    onInputChange,
    noOptionsText,
    loadingText,
    placeholder,
    renderOption,
    getOptionLabel: _getOptionLabel,
    renderTags: _renderTags,
    operatorValues,
    ...rest
}: ValueSelectProps<V, M, D>) => {
    const { getIntlText } = useI18n();
    const [open, setOpen] = useState<boolean>(false);

    const { options, allOptionsMap, searchLoading, onSearch } = useOptions({
        operatorValues,
    });

    const { selectedMap, onItemChange } = useSelectedValue({
        value,
        onChange,
        optionsMap: allOptionsMap as ValueSelectInnerProps<V>['optionsMap'],
        multiple,
        onSearch,
    });

    /**
     * Gets the display text for the input box based on the selected option.
     */
    const getOptionLabel = useCallback<NonNullable<ValueSelectProps['getOptionLabel']>>(
        (option: SelectValueOptionType) => {
            return option.label || '';
        },
        [_getOptionLabel],
    );

    /**
     * Renders the input component for the Autocomplete.
     */
    const renderInput = useCallback<AutocompleteProps<V, D, M, false>['renderInput']>(
        params => {
            return (
                <TextField
                    {...params}
                    InputProps={{
                        ...params.InputProps,
                    }}
                    sx={{ minWidth: '220px' }}
                    placeholder={
                        (isArray(value) ? value : [value]).length
                            ? ''
                            : placeholder || getIntlText('common.placeholder.select')
                    }
                />
            );
        },
        [placeholder, value],
    );

    /**
     * Renders the tags for the selected values when multiple selection is enabled.
     */
    const renderTags = useCallback<NonNullable<ValueSelectProps<V, M, D>['renderTags']>>(
        (value, getTagProps, ownerState) => {
            return _renderTags
                ? _renderTags(value, getTagProps, ownerState)
                : getIntlText('common.label.item_selected', { 1: value.length });
        },
        [value, multiple],
    );

    /**
     * Handles the change event when an option is selected or cleared.
     */
    const handleChange = useCallback<NonNullable<AutocompleteProps<V, M, D, false>['onChange']>>(
        (_event, value) => {
            onChange?.(value);
        },
        [onChange],
    );

    /**
     * Handles opening of the select menu.
     */
    const handleSelectOpen = useCallback(
        async (event: React.SyntheticEvent) => {
            setOpen(true);
            onOpen?.(event);
        },
        [onOpen],
    );

    /**
     * Handles closing of the select menu.
     */
    const handleSelectClose = useCallback(
        (...params: Parameters<NonNullable<ValueSelectProps<V, M, D>['onClose']>>) => {
            setOpen(false);
            onClose?.(...params);
        },
        [onClose],
    );

    /**
     * Handles the input change event.
     */
    const handleInputChange = useCallback<AutocompletePropsOverrides['onInputChange']>(
        (event: React.SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
            if (reason === 'input') {
                onSearch?.(value);
            }
            if (reason === 'blur' || reason === 'clear') {
                onSearch?.('');
            }
            onInputChange?.(event, value, reason);
        },
        [onInputChange, onSearch],
    );

    const slotProps = useMemo(
        () => ({
            listbox: {
                component: VirtualSelect,
                options,
                selectedMap,
                renderOption,
                onItemChange: (event: React.SyntheticEvent, option: V) => {
                    if (!multiple) {
                        handleSelectClose(event, 'selectOption');
                    }
                    onItemChange(option);
                },
            },
        }),
        [options, selectedMap, multiple, onItemChange, handleSelectClose],
    );

    return (
        <Autocomplete<V, M, D>
            value={value}
            onChange={handleChange}
            multiple={multiple}
            options={options as V[]}
            open={open}
            onOpen={handleSelectOpen}
            onClose={handleSelectClose}
            loading={searchLoading}
            slotProps={slotProps}
            getOptionLabel={getOptionLabel}
            onInputChange={handleInputChange}
            renderInput={renderInput}
            renderTags={renderTags}
            noOptionsText={
                noOptionsText || (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px 8px',
                        }}
                    >
                        {getIntlText('common.label.no_options')}
                    </Box>
                )
            }
            loadingText={
                loadingText || (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '10px 8px',
                        }}
                    >
                        {getIntlText('common.label.loading')}
                    </Box>
                )
            }
            {...rest}
        />
    );
};

export default ValueSelect;
