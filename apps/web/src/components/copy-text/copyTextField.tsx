import React, { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import {
    ContentCopyIcon,
    VisibilityIcon,
    VisibilityOffIcon,
} from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';

import './style.less';

export type CopyTextFieldProps = TextFieldProps & {
    /** text show type text or password */
    type?: 'text' | 'password';
};

/**
 * can copy textField component
 */
const CopyTextField: React.FC<CopyTextFieldProps> = props => {
    const { value, type = 'text' } = props;

    const { handleCopy } = useCopy();
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // copy text value
    const handleClickCopy = (event?: any) => {
        handleCopy(
            value ? String(value) : '',
            (event?.target as HTMLElement).parentElement || undefined,
        );
    };

    // switch password or text
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="ms-copy-textField">
            <TextField
                {...props}
                type={type === 'text' || showPassword ? 'text' : 'password'}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                {type === 'password' && (
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                        sx={{ mr: 0.1 }}
                                    >
                                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                    </IconButton>
                                )}
                                <IconButton
                                    aria-label="copy text"
                                    onClick={handleClickCopy}
                                    onMouseDown={(e: any) => e.preventDefault()}
                                    onMouseUp={(e: any) => e.preventDefault()}
                                    edge="end"
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </div>
    );
};

export default CopyTextField;
