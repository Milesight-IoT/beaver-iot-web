import { useMemo } from 'react';
import {
    Select as MuiSelect,
    SelectProps as MuiSelectProps,
    ListSubheader,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';

type Props = {
    /**
     * Drop-down option
     */
    options: OptionsProps[];
    /**
     * Custom drop-down option
     * @returns Return to the customized drop -down option content
     */
    renderOptions?: (options: (OptionsProps & { description?: string })[]) => any[];
};

export type SelectProps = Props & MuiSelectProps;

const Select = (props: SelectProps) => {
    const { options, renderOptions, style, label, ...rest } = props;

    // Conversion of down pull option data
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
        <FormControl sx={{ ...style }}>
            {!!label && (
                <InputLabel size={rest?.size as any} required={rest?.required} id="select-label">
                    {label}
                </InputLabel>
            )}
            <MuiSelect {...rest} label={label} labelId="select-label">
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
