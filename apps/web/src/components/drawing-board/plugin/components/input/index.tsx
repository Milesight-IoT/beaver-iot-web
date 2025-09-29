import { useState, useEffect } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

type InputType = TextFieldProps;

const Input = (props: InputType) => {
    const { value, onChange, ...rest } = props;

    const [inputVal, setInputVal] = useState(value);

    useEffect(() => {
        setInputVal(value);
    }, [value]);

    /**
     * Debounce Input resolved
     */
    const handleChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputVal(e?.target?.value || '');
    });

    const handleBlur = useMemoizedFn((e: React.FocusEvent<HTMLInputElement>) => {
        onChange?.(e);
    });

    return (
        <TextField
            {...rest}
            value={inputVal}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth={rest.fullWidth !== false}
        />
    );
};

export default Input;
