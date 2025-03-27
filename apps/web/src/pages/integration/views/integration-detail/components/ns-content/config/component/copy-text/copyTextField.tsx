import React from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { ContentCopyIcon } from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';

import './style.less';

/**
 * can copy textField component
 */
const CopyTextField: React.FC<TextFieldProps> = props => {
    const { value, startIcon, endIcon } = props;
    const { handleCopy } = useCopy();

    // copy text value
    const handleClickCopy = () => {
        handleCopy(value ? String(value) : '');
    };

    return (
        <div className="copy-textField">
            <TextField
                {...props}
                slotProps={{
                    input: {
                        startAdornment: startIcon || null,
                        endAdornment: endIcon || (
                            <InputAdornment position="end">
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

export default CopyTextField;
