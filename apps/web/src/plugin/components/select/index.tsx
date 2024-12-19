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
     * 下拉选项
     */
    options: OptionsProps[];
    /**
     * 自定义下拉选项
     * @returns 返回自定义下拉选项内容
     */
    renderOptions?: (options: (OptionsProps & { description?: string })[]) => any[];
};

export type SelectProps = Props & MuiSelectProps;

const Select = (props: SelectProps) => {
    const { options, renderOptions, style, title, ...rest } = props;

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
            {!!title && (
                <InputLabel size={rest?.size as any} required={rest?.required} id="select-label">
                    {title}
                </InputLabel>
            )}
            <MuiSelect {...rest} label={title} labelId="select-label">
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
