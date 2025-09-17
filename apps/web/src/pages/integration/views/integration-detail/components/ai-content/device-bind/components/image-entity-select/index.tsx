import React, { useCallback, useEffect, useMemo } from 'react';
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
import { useRequest } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon, BrokenImageIcon } from '@milesight/shared/src/components';
import {
    camthinkApi,
    awaitWrap,
    getResponseData,
    isRequestSuccess,
    type CamthinkAPISchema,
} from '@/services/http';
import ImagePreview from '../image-preview';
import './style.less';

export type ValueType = Partial<
    CamthinkAPISchema['getDeviceImageEntities']['response']['content'][0]
> & {
    key: string;
};

type ImageEntitySelectProps<
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
    deviceId?: ApiKey | null;
    onReadyStateChange?: (isReady: boolean, options?: Value[]) => void;
};

/**
 * ImageEntitySelect Component
 */
const ImageEntitySelect = <
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
    deviceId,
    label,
    required,
    value,
    onChange,
    onReadyStateChange,
    ...props
}: ImageEntitySelectProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => {
    const { getIntlText } = useI18n();

    // ---------- Get image entities ----------
    const { loading, data: imageEntities } = useRequest(
        async () => {
            if (!deviceId) {
                onReadyStateChange?.(false);
                return;
            }
            const [err, resp] = await awaitWrap(
                camthinkApi.getDeviceImageEntities({ id: deviceId }),
            );

            if (err || !isRequestSuccess(resp)) return;
            const data = getResponseData(resp)?.content;

            // Execute the onReadyStateChange callback on next tick
            setTimeout(() => {
                onReadyStateChange?.(true, data as Value[]);
            }, 100);
            return data;
        },
        {
            debounceWait: 300,
            refreshDeps: [deviceId],
        },
    );

    // Clear value when item not in imageEntities
    useEffect(() => {
        if (!value || typeof value === 'string') return;
        if (!Array.isArray(value)) {
            const hasItem = !!imageEntities?.find(item => item.key === value?.key);
            !hasItem &&
                onChange?.(
                    {} as React.SyntheticEvent,
                    null as AutocompleteValue<Value, Multiple, DisableClearable, FreeSolo>,
                    'selectOption',
                );
            return;
        }

        const everyIn = value.every(item => {
            if (typeof item === 'string') return true;
            return !!imageEntities?.find(i => i.key === item.key);
        });

        !everyIn &&
            onChange?.(
                {} as React.SyntheticEvent,
                null as AutocompleteValue<Value, Multiple, DisableClearable, FreeSolo>,
                'selectOption',
            );
    }, [value, deviceId, imageEntities]);

    // ---------- Render Custom Autocomplete ----------
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
                }}
                label={label}
                required={required}
                placeholder={getIntlText('common.placeholder.select')}
            />
        ),
        [size, label, required, getIntlText],
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

            return value.map(({ name }, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                    <Tooltip key={key} title={name}>
                        <Chip label={name} {...tagProps} />
                    </Tooltip>
                );
            });
        },
        [multiple],
    );

    /**
     * Renders the option list items.
     */
    const renderOption = useCallback<
        NonNullable<
            AutocompleteProps<
                Value,
                Multiple,
                DisableClearable,
                FreeSolo,
                ChipComponent
            >['renderOption']
        >
    >(({ key, className, ...props }, option) => {
        return (
            <li {...props} key={key} className={cls('ms-image-entity-select-option', className)}>
                <div className="img-preview">
                    {!option.value ? (
                        <BrokenImageIcon />
                    ) : (
                        <ImagePreview id={option.key} src={option.value!} width="24" height="20" />
                    )}
                </div>
                <div className="name">{option.name}</div>
            </li>
        );
    }, []);

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
            const item = imageEntities?.find(entity => entity.key === option.key);
            return item?.name || option.name || '';
        },
        [imageEntities],
    );

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
        return option.key === value.key;
    }, []);

    /**
     * Custom Render listbox & popper
     */
    const slotProps = useMemo<
        AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>['slotProps']
    >(
        () => ({
            popper: {
                className: 'ms-image-entity-select-popper',
                placement: 'bottom-start',
            },
        }),
        [],
    );

    return (
        <Autocomplete<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
            fullWidth
            className={cls('ms-image-entity-select', className)}
            {...props}
            size={size}
            multiple={multiple}
            loading={loading}
            popupIcon={<KeyboardArrowDownIcon />}
            renderInput={renderInput}
            renderTags={renderTags}
            renderOption={renderOption}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            slotProps={slotProps}
            options={(imageEntities as Value[]) || []}
            loadingText={
                loadingText || (
                    <div className="ms-image-entity-select__loading">
                        {getIntlText('common.label.loading')}
                    </div>
                )
            }
            noOptionsText={
                noOptionsText || (
                    <div className="ms-image-entity-select__empty">
                        {getIntlText('common.label.no_options')}
                    </div>
                )
            }
            value={value}
            onChange={onChange}
        />
    );
};

export default ImageEntitySelect;
