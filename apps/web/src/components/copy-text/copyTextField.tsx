import React, { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { useCopy } from '@milesight/shared/src/hooks';
import {
    ContentCopyIcon,
    VisibilityIcon,
    VisibilityOffIcon,
} from '@milesight/shared/src/components';

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
        // fix when parentElement is svg or path copy fail
        let parentElement = event?.target?.parentElement;
        if (parentElement.localName === 'svg') {
            parentElement = event?.target?.parentElement?.parentElement;
        }
        handleCopy(value ? String(value) : '', parentElement);
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
                                    <>
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            sx={{ mr: 0.1 }}
                                        >
                                            {showPassword ? (
                                                <VisibilityIcon />
                                            ) : (
                                                <VisibilityOffIcon />
                                            )}
                                        </IconButton>
                                        <div className="ms-copy-textField-divider" />
                                    </>
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
