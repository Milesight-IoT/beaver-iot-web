import { useMemo } from 'react';
import {
    Select as MuiSelect,
    SelectProps as MuiSelectProps,
    ListSubheader,
    MenuItem,
    FormControl,
    FormControlProps as MuiFormControlProps,
    InputLabel,
} from '@mui/material';

type Props<T extends ApiKey> = {
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
};

export type SelectProps<T extends ApiKey> = Props<T> & MuiSelectProps<T>;

const Select = <T extends ApiKey = ApiKey>(props: SelectProps<T>) => {
    const { options, renderOptions, style, label, formControlProps, ...rest } = props;

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

    return (
        <FormControl sx={{ ...style }} fullWidth {...(formControlProps || {})}>
            {!!label && (
                <InputLabel size={rest?.size as any} required={rest?.required} id="select-label">
                    {label}
                </InputLabel>
            )}
            <MuiSelect {...rest} label={label} labelId="select-label" notched>
                {renderOptions
                    ? renderOptions(options)
                    : getMenuItems?.map((item: OptionsProps) => {
                          return item?.value ? (
                              <MenuItem value={item.value} key={item.value}>
                                  {item.label}
                              </MenuItem>
                          ) : (
                              <ListSubheader>{item.label}</ListSubheader>
                          );
                      })}
            </MuiSelect>
        </FormControl>
    );
};

export default Select;
