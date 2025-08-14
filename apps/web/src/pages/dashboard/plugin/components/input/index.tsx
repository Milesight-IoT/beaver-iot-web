import { useState, useEffect, useRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

type InputType = TextFieldProps;

const Input = (props: InputType) => {
    const { sx, title, value, onChange, ...rest } = props;

    const [inputVal, setInputVal] = useState(value);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setInputVal(value);
    }, [value]);

    /**
     * Debounce Input resolved
     */
    const handleChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputVal(e?.target?.value || '');

        timeoutRef.current && clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onChange?.(e);
        }, 250);
    });

    return (
        <TextField
            {...rest}
            value={inputVal}
            onChange={handleChange}
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
