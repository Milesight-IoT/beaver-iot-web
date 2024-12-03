import {
    Switch as MuiSwitch,
    SwitchProps as MuiSwitchProps,
    FormControlLabel,
} from '@mui/material';

type SwitchProps = MuiSwitchProps & {
    label?: string;
};

const Switch = (props: SwitchProps) => {
    const { label, className, value, ...rest } = props;

    return (
        <FormControlLabel
            className={className}
            control={<MuiSwitch {...rest} checked={!!value} />}
            label={label}
        />
    );
};

export default Switch;
