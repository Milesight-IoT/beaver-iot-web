import {
    Switch as MuiSwitch,
    SwitchProps as MuiSwitchProps,
    FormControlLabel,
} from '@mui/material';

type SwitchProps = MuiSwitchProps;

const Switch = (props: SwitchProps) => {
    const { title, className, value, ...rest } = props;

    return (
        <FormControlLabel
            className={className}
            sx={{ width: '100%' }}
            control={<MuiSwitch {...rest} checked={!!value} />}
            label={title}
        />
    );
};

export default Switch;
