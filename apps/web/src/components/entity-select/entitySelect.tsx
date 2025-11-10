import React, { useState, useCallback, useMemo } from 'react';
import { omit } from 'lodash-es';
import { Autocomplete, TextField, AutocompleteProps, Chip, Tooltip } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { EntityList, EntityPaper, EntityPopper } from './components';
import { useSelectValue } from './hooks';
import type { EntitySelectComponentProps, EntitySelectValueType } from './types';
import './style.less';

/**
 * EntitySelect Component
 */
const EntitySelect = <
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    EntityAutocompleteProps extends Required<
        AutocompleteProps<Value, Multiple, DisableClearable, false>
    > = Required<AutocompleteProps<Value, Multiple, DisableClearable, false>>,
>(
    props: EntitySelectComponentProps<Value, Multiple, DisableClearable>,
) => {
    const {
        label,
        required,
        value = null as EntitySelectValueType,
        multiple,
        loading,
        onChange,
        onOpen,
        onClose,
        onInputChange,
        onSearch,
        error,
        helperText,
        placeholder,
        dropdownPlacement,
        dropdownMatchSelectWidth,
        maxCount,
        tabType,
        setTabType,
        options,
        entityOptionMap,
        getOptionValue,
        size = 'medium',
        noOptionsText,
        loadingText,
        endAdornment,
        ...rest
    } = props;

    const { getIntlText } = useI18n();
    // State to manage the open/close status of the select menu
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const open = Boolean(anchorEl);

    const { selectedEntityMap, selectedDeviceMap, onEntityChange } = useSelectValue<
        Value,
        Multiple,
        DisableClearable
    >({
        value,
        multiple,
        onChange,
        entityOptionMap,
        getOptionValue,
        onSearch,
    });

    /**
     * Handles opening of the select menu.
     */
    const handleSelectOpen = useCallback<Required<EntityAutocompleteProps>['onOpen']>(
        event => {
            setAnchorEl(event.currentTarget as HTMLDivElement);
            onOpen?.(event);
        },
        [onOpen],
    );

    /**
     * Handles closing of the select menu.
     */
    const handleSelectClose = useCallback<Required<EntityAutocompleteProps>['onClose']>(
        (...params) => {
            setAnchorEl(null);
            onClose?.(...params);
        },
        [onClose],
    );

    /**
     * Handles the change event when an option is selected or cleared.
     */
    const handleChange = useCallback<EntityAutocompleteProps['onChange']>(
        (_event, value) => {
            onChange?.(value);
        },
        [onChange],
    );

    /**
     * Handles the input change event.
     */
    const handleInputChange = useCallback<EntityAutocompleteProps['onInputChange']>(
        (event, value, reason) => {
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

    /**
     * Renders the input component for the Autocomplete.
     */
    const renderInput = useCallback<EntityAutocompleteProps['renderInput']>(
        params => (
            <TextField
                {...params}
                InputProps={{
                    ...params.InputProps,
                    size,
                    endAdornment: (
                        <>
                            {params.InputProps.endAdornment}
                            {endAdornment}
                        </>
                    ),
                }}
                error={error}
                helperText={helperText}
                label={label}
                required={required}
                placeholder={placeholder}
            />
        ),
        [error, helperText, label, required, placeholder, size, endAdornment],
    );

    /**
     * Renders the tags for the selected values when multiple selection is enabled.
     */
    const renderTags = useCallback<EntityAutocompleteProps['renderTags']>(
        (value, getTagProps) => {
            if (!multiple) return;

            const valueList = value
                .map(v => entityOptionMap.get(getOptionValue(v))!)
                .filter(Boolean);
            return valueList.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                    <Tooltip key={key} title={option.description}>
                        <Chip label={option.label} {...tagProps} />
                    </Tooltip>
                );
            });
        },
        [entityOptionMap, getOptionValue, multiple],
    );

    /**
     * Gets the display text for the input box based on the selected option.
     */
    const getOptionLabel = useCallback<EntityAutocompleteProps['getOptionLabel']>(
        option => {
            const value = getOptionValue(option);

            const currentOption = entityOptionMap.get(value);
            return currentOption?.label || '';
        },
        [entityOptionMap, getOptionValue],
    );

    const filterOptions = useCallback<EntityAutocompleteProps['filterOptions']>(
        options => options,
        [],
    );

    // Memoize custom slots and slot props to optimize rendering
    const slotProps = useMemo(
        () => ({
            listbox: {
                component: EntityList,
                tabType,
                options,
                maxCount,
                selectedEntityMap,
                selectedDeviceMap,
                onEntityChange(...args: Parameters<typeof onEntityChange>) {
                    if (!multiple) {
                        handleSelectClose({} as React.SyntheticEvent, 'selectOption');
                    }
                    onEntityChange(...args);
                },
            },
            paper: { component: EntityPaper, tabType, setTabType },
            popper: { component: EntityPopper, dropdownPlacement, dropdownMatchSelectWidth },
        }),
        [
            dropdownPlacement,
            dropdownMatchSelectWidth,
            setTabType,
            tabType,
            options,
            selectedEntityMap,
            selectedDeviceMap,
            maxCount,
            multiple,
            onEntityChange,
            handleSelectClose,
        ],
    );

    return (
        <Autocomplete<Value, Multiple, DisableClearable, false>
            {...omit(rest, [
                'fieldName',
                'entityType',
                'entityValueType',
                'entityAccessMod',
                'excludeChildren',
                'filterOption',
            ])}
            size={size}
            open={open}
            value={value}
            options={options as Value[]}
            multiple={multiple}
            onChange={handleChange}
            onOpen={handleSelectOpen}
            onClose={handleSelectClose}
            onInputChange={handleInputChange}
            getOptionLabel={getOptionLabel}
            renderTags={renderTags}
            renderInput={renderInput}
            slotProps={slotProps}
            loading={loading}
            filterOptions={filterOptions}
            noOptionsText={
                noOptionsText || (
                    <div className="ms-entity-select__empty">
                        {getIntlText('common.label.no_options')}
                    </div>
                )
            }
            loadingText={
                loadingText || (
                    <div className="ms-entity-select__loading">
                        {getIntlText('common.label.loading')}
                    </div>
                )
            }
        />
    );
};
export default React.memo(EntitySelect) as unknown as typeof EntitySelect;
