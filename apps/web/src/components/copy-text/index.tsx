import React, { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { useCopy } from '@milesight/shared/src/hooks';
import {
    ContentCopyIcon,
    VisibilityIcon,
    VisibilityOffIcon,
} from '@milesight/shared/src/components';

import './style.less';

/**
 * can copy textField component
 */
const CopyTextField: React.FC<TextFieldProps> = props => {
    const { value, type = 'text' } = props;

    const { handleCopy } = useCopy();
    const [showPassword, setShowPassword] = useState<boolean>(false);

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
                                    onClick={e => {
                                        handleCopy(
                                            value ? String(value) : '',
                                            e.currentTarget?.closest('div'),
                                        );
                                    }}
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
