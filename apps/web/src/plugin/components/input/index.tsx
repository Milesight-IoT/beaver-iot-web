import { TextField, TextFieldProps } from '@mui/material';

type InputType = TextFieldProps;

const Input = (props: InputType) => {
    const { sx, title, ...rest } = props;

    return (
        <TextField
            {...rest}
            label={title}
            fullWidth={rest.fullWidth !== false}
            sx={{
                input: {
                    ...(sx as any),
                },
            }}
        />
    );
};

export default Input;
