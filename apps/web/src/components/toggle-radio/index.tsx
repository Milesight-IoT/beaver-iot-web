import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useControllableValue } from 'ahooks';
import cls from 'classnames';
import './style.less';

type ValueType = string | number;

export interface Props {
    size?: 'default' | 'small';

    value?: ValueType;

    defaultValue?: ValueType;

    options: {
        label: React.ReactNode;
        value: ValueType;
    }[];

    disabled?: boolean;

    onChange?: (value: ValueType) => void;
}

/**
 * ToggleRadio Component
 */
const ToggleRadio: React.FC<Props> = ({ size = 'default', options, disabled, ...props }) => {
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
            sx={{ my: 1.5 }}
        >
            {options?.map(({ label, value }) => (
                <ToggleButton key={value} value={value}>
                    {label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default ToggleRadio;
