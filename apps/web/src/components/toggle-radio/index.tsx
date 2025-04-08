import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useControllableValue } from 'ahooks';

type ValueType = 'string' | 'number';

export interface Props {
    value?: ValueType;

    defaultValue?: ValueType;

    options: {
        label: string;
        value: ValueType;
    }[];

    disabled?: boolean;

    onChange?: (value: ValueType) => void;
}

/**
 * ToggleRadio Component
 */
const ToggleRadio: React.FC<Props> = ({ options, disabled, ...props }) => {
    const [value, setValue] = useControllableValue<ValueType>(props);

    return (
        <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            className="ms-toggle-button-group ms-workflow-mode-buttons"
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
                <ToggleButton value={value} aria-label={label}>
                    {label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default ToggleRadio;
