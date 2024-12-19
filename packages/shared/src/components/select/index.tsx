import { useMemo } from 'react';
import {
    Select as MuiSelect,
    SelectProps as MuiSelectProps,
    ListSubheader,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';

type Props<T extends ApiKey> = {
    /**
     * 下拉选项
     */
    options: OptionsProps<T>[];
    /**
     * 自定义下拉选项
     * @returns 返回自定义下拉选项内容
     */
    renderOptions?: (options: (OptionsProps<T> & { description?: string })[]) => any[];
};

export type SelectProps<T extends ApiKey> = Props<T> & MuiSelectProps<T>;

const Select = <T extends ApiKey = ApiKey>(props: SelectProps<T>) => {
    const { options, renderOptions, style, label, ...rest } = props;

    // 转换下拉选项数据
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
                <InputLabel size={rest?.size as any} id="select-label">
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
