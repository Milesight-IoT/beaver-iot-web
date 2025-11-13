import React from 'react';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { useControllableValue } from 'ahooks';
import cls from 'classnames';
import './style.less';

// type ValueType = string | number;

export interface Props<ValueType = string | number> {
    size?: 'default' | 'small';

    value?: ValueType;

    defaultValue?: ValueType;

    options: {
        label: React.ReactNode;
        value: ValueType;
    }[];

    disabled?: boolean;

    onChange?: (value: ValueType) => void;

    sx?: ToggleButtonGroupProps['sx'];
}

/**
 * ToggleRadio Component
 */
const ToggleRadio = <ValueType extends string | number>({
    size = 'default',
    options,
    disabled,
    sx,
    ...props
}: Props<ValueType>) => {
    const [value, setValue] = useControllableValue<ValueType>(props);

    return (
        <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            className={cls('ms-toggle-button-group', {
                [`ms-toggle-button-group-${size}`]: size === 'small',
            })}
            disabled={disabled}
            value={value || props.defaultValue}
            defaultValue={props.defaultValue}
            onChange={(_, val) => {
                if (!val) return;
                setValue(val);
            }}
            sx={{ my: 1.5, ...sx }}
        >
            {options?.map(option => (
                <ToggleButton
                    key={option.value}
                    value={option.value}
                    className={cls('ms-toggle-button-group-item', {
                        'ms-toggle-button-group-item__active': value === option.value,
                    })}
                >
                    {option.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default ToggleRadio;
