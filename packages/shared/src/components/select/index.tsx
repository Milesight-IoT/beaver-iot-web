import React, { useCallback, useMemo } from 'react';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import { type FieldError } from 'react-hook-form';
import {
    Select as MuiSelect,
    SelectProps as MuiSelectProps,
    ListSubheader,
    MenuItem,
    FormControl,
    FormHelperText,
    FormControlProps as MuiFormControlProps,
    InputLabel,
} from '@mui/material';
import { useI18n } from '../../hooks';
import './style.less';

type Props<T extends ApiKey> = {
    /**
     * If true, the outline is notched to accommodate the label
     */
    notched?: boolean;
    /**
     * Field error
     */
    error?: FieldError;
    /**
     * Drop-down option
     */
    options: OptionsProps<T>[];
    /**
     * Custom drop-down option
     * @returns Return to the customized drop-down option content
     */
    renderOptions?: (options: (OptionsProps<T> & { description?: string })[]) => any[];
    /**
     * Form control props
     */
    formControlProps?: MuiFormControlProps;
    /**
     * Custom empty content
     */
    renderEmpty?: () => React.ReactNode;
};

export type SelectProps<T extends ApiKey> = Props<T> & Omit<MuiSelectProps<T>, 'error'>;

const Select = <T extends ApiKey = ApiKey>(props: SelectProps<T>) => {
    const {
        options,
        renderOptions,
        style,
        label,
        error,
        disabled,
        formControlProps,
        className,
        placeholder,
        displayEmpty,
        multiple,
        renderValue,
        renderEmpty,
        ...rest
    } = props;
    const { getIntlText } = useI18n();

    // Conversion of down pull option data on of down pull option data
    const getMenuItems = useMemo(() => {
        const list: OptionsProps[] = [];
        const loopItem = (item: OptionsProps): any => {
            if (item.options?.length) {
                list.push({ label: item.label });
                item.options.forEach((subItem: OptionsProps) => {
                    loopItem(subItem);
                });
            } else {
                list.push({ label: item.label, value: item.value });
            }
        };
        options?.forEach((item: OptionsProps) => {
            loopItem(item);
        });
        return list;
    }, [options]);

    /** custom render value */
    const customRenderValue = useCallback<Required<SelectProps<T>>['renderValue']>(
        selected => {
            const selectedValue = (
                Array.isArray(selected) ? selected : selected ? [selected] : []
            ) as T[];

            if (!selectedValue?.length) {
                return <div className="ms-select__placeholder">{placeholder}</div>;
            }

            if (renderValue) return renderValue(selected);
            // Render the corresponding label content
            return selectedValue
                .filter(v => !isNil(v))
                .map(v => {
                    return options.find(k => k.value === v)?.label;
                })
                .join(', ');
        },
        [placeholder, renderValue, options],
    );
    /** custom render empty content */
    const customRenderEmpty = useCallback<Required<SelectProps<T>>['renderEmpty']>(() => {
        if (options?.length) return null;
        if (renderEmpty) return renderEmpty();

        return <div className="ms-select__empty">{getIntlText('common.label.no_options')}</div>;
    }, [options, renderEmpty, getIntlText]);

    return (
        <FormControl sx={{ ...style }} fullWidth {...(formControlProps || {})}>
            {!!label && (
                <InputLabel
                    id="select-label"
                    size={rest?.size as any}
                    required={rest?.required}
                    error={!!error}
                    disabled={disabled}
                >
                    {label}
                </InputLabel>
            )}
            <MuiSelect
                {...rest}
                className={cls('ms-select', className)}
                multiple={multiple}
                // @ts-ignore
                notched
                label={label}
                labelId="select-label"
                error={!!error}
                disabled={disabled}
                displayEmpty={!!placeholder || displayEmpty}
                placeholder={placeholder}
                renderValue={customRenderValue}
            >
                {customRenderEmpty()}
                {renderOptions
                    ? renderOptions(options)
                    : getMenuItems?.map((item: OptionsProps) => {
                          return item?.value !== undefined ? (
                              <MenuItem value={item.value} key={item.value}>
                                  {item.label}
                              </MenuItem>
                          ) : (
                              <ListSubheader>{item.label}</ListSubheader>
                          );
                      })}
            </MuiSelect>
            {!!error && <FormHelperText error>{error.message}</FormHelperText>}
        </FormControl>
    );
};

export default Select;
