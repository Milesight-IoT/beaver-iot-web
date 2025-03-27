import React, { useState } from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import {
    ContentCopyIcon,
    VisibilityIcon,
    VisibilityOffIcon,
} from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';

import './style.less';

/**
 * can copy password textField component
 *
 */
const CopyPwdTextField: React.FC<TextFieldProps> = props => {
    const { value, endIcon, startIcon } = props;
    const { handleCopy } = useCopy();
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // switch password or text
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // copy text value
    const handleClickCopy = () => {
        handleCopy(value ? String(value) : '');
    };

    return (
        <div className="copy-textField">
            <TextField
                {...props}
                type={showPassword ? 'text' : 'password'}
                slotProps={{
                    input: {
                        startAdornment: startIcon || null,
                        endAdornment: endIcon || (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                </IconButton>
                                <IconButton
                                    aria-label="copy text"
                                    onClick={handleClickCopy}
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

export default CopyPwdTextField;
