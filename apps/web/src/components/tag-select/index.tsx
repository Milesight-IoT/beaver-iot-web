import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    Autocomplete,
    Chip,
    TextField,
    Tooltip,
    type AutocompleteProps,
    type AutocompleteValue,
    type ChipTypeMap,
} from '@mui/material';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import List from './list';
import useTagSelectStore from './store';
import type { ValueType } from './typings';
import './style.less';

type TagSelectProps<
    Value extends ValueType = ValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = true,
    ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = Omit<
    AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
    'options' | 'renderInput'
> & {
    label?: string;
    required?: boolean;
    // popperWidth?: number;
    onReadyStateChange?: (isReady: boolean, options?: Value[]) => void;
};

/**
 * TagSelect Component
 */
const TagSelect = <
    Value extends ValueType = ValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = true,
    ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>({
    size,
    multiple,
    loadingText,
    noOptionsText,
    className,
    label,
    required,
    // popperWidth = 500,
    value,
    onChange,
    onReadyStateChange,
    ...props
}: TagSelectProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
    const { getIntlText } = useI18n();

    // ---------- Get Tag list ----------
    const { tags, isDataReady, getTags, refreshTags } = useTagSelectStore(
        useStoreShallow(['tags', 'isDataReady', 'getTags', 'refreshTags']),
    );

    // Execute the onReadyStateChange callback when the data is ready
    useEffect(() => {
        if (!isDataReady) return;
        // Execution on next tick
        setTimeout(() => {
            onReadyStateChange?.(true, tags as Value[]);
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tags, isDataReady]);

    // Only refresh when component mounted
    useEffect(() => {
        onReadyStateChange?.(false);
        refreshTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- Get search result ----------
    const [searchTags, setSearchTags] = useState<ValueType[] | null>();
    const { run: handleSearch } = useDebounceFn(
        async (keyword?: string | null) => {
            keyword = keyword?.trim().toLocaleLowerCase();

            if (!keyword) {
                setSearchTags(undefined);
                return;
            }

            // const result = await getTags({ keyword });
            const result = tags?.filter(
                ({ name, description }) =>
                    name?.toLocaleLowerCase().includes(keyword) ||
                    description?.toLocaleLowerCase().includes(keyword),
            );
            setSearchTags(result);
        },
        {
            wait: 300,
        },
    );

    // ---------- Interactions ----------
    // Popper open
    const [popperOpen, setPopperOpen] = useState(false);

    // Input Value
    const [inputValue, setInputValue] = useState('');
    const handleInputChange = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['onInputChange']
        >
    >(
        (_, value, reason) => {
            // console.log({ _, value, reason });
            setInputValue(value);

            switch (reason) {
                case 'blur':
                case 'reset':
                    handleSearch('');
                    break;
                case 'input':
                    handleSearch(value);
                    break;
                default:
                    break;
            }
        },
        [handleSearch],
    );

    // Value Change
    const handleChange = useMemoizedFn(
        (value: AutocompleteValue<Value, Multiple, DisableClearable, FreeSolo>) => {
            if (!multiple) {
                setPopperOpen(false);
            }

            onChange?.({} as React.SyntheticEvent, value, 'selectOption');
        },
    );

    // ---------- Render Custom Autocomplete ----------
    const tagEntitiesCount = useMemo(() => {
        if (!value || typeof value === 'string' || Array.isArray(value)) return null;
        const tag = tags?.find(tag => tag.id === value.id);

        if (!tag) return null;
        return tag.tagged_entities_count || 0;
    }, [value, tags]);
    /**
     * Renders the input component for the Autocomplete.
     */
    const renderInput = useCallback<
        AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['renderInput']
    >(
        params => (
            <TextField
                {...params}
                InputProps={{
                    ...params.InputProps,
                    size,
                    label,
                    required,
                    endAdornment: (
                        <>
                            <div className="ms-tag-select-entity-count">
                                {isNil(tagEntitiesCount)
                                    ? null
                                    : getIntlText('workflow.label.entity_count', {
                                          1: tagEntitiesCount,
                                      })}
                            </div>
                            {params.InputProps?.endAdornment}
                        </>
                    ),
                }}
                label={label}
                required={required}
                placeholder={getIntlText('common.placeholder.select_tag')}
            />
        ),
        [size, label, required, tagEntitiesCount, getIntlText],
    );

    /**
     * Renders the tags for the selected values when multiple selection is enabled.
     */
    const renderTags = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['renderTags']
        >
    >(
        (value, getTagProps) => {
            if (!multiple) return;

            return value.map(({ name, tagged_entities_count: count }, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                    <Tooltip
                        key={key}
                        title={getIntlText('workflow.label.entity_count', { 1: count })}
                    >
                        <Chip label={name} {...tagProps} />
                    </Tooltip>
                );
            });
        },
        [multiple, getIntlText],
    );

    /**
     * Gets the display text for the input box based on the selected option.
     */
    const getOptionLabel = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['getOptionLabel']
        >
    >(
        option => {
            if (typeof option === 'string') return option;
            const item = tags?.find(tag => tag.id === option.id);
            return item?.name || option.name || '';
        },
        [tags],
    );

    /**
     * Disable the built-in filtering
     */
    const filterOptions = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['filterOptions']
        >
    >(option => option, []);

    const isOptionEqualToValue = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['isOptionEqualToValue']
        >
    >((option, value) => {
        if (typeof option === 'string' && typeof value === 'string') {
            return option === value;
        }
        return option.id === value.id;
    }, []);

    /**
     * Custom Render listbox & popper
     */
    const slotProps = useMemo<
        AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['slotProps']
    >(
        () => ({
            listbox: {
                multiple,
                tags,
                searchTags,
                value,
                onSelectedChange: handleChange,
                component: List,
            },
            popper: {
                className: 'ms-tag-select-popper',
                placement: 'bottom-start',
            },
        }),
        [value, multiple, tags, searchTags, handleChange],
    );

    return (
        <Autocomplete<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
            fullWidth
            className={cls('ms-tag-select', className)}
            {...props}
            size={size}
            multiple={multiple}
            popupIcon={<KeyboardArrowDownIcon />}
            renderInput={renderInput}
            renderTags={renderTags}
            filterOptions={filterOptions}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            slotProps={slotProps}
            options={(tags as Value[]) || []}
            loadingText={
                loadingText || (
                    <div className="ms-tag-select__loading">
                        {getIntlText('common.label.loading')}
                    </div>
                )
            }
            noOptionsText={
                noOptionsText || (
                    <div className="ms-tag-select__empty">
                        {getIntlText('common.label.no_options')}
                    </div>
                )
            }
            open={popperOpen}
            onOpen={() => {
                // Refresh tags when popper open
                refreshTags(true);
                setPopperOpen(true);
            }}
            onClose={() => setPopperOpen(false)}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            value={value}
            onChange={onChange}
        />
    );
};

export type { ValueType };

export { useTagSelectStore };
export default TagSelect;
