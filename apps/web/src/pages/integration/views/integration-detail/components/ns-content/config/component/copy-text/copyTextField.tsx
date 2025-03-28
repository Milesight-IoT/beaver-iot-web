import React from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { ContentCopyIcon } from '@milesight/shared/src/components';
import { useCopy } from '@milesight/shared/src/hooks';

import './style.less';

/**
 * can copy textField component
 */
const CopyTextField: React.FC<TextFieldProps> = props => {
    const { value } = props;
    const { handleCopy } = useCopy();

    // copy text value
    const handleClickCopy = (e: React.ChangeEvent<HTMLDivElement>) => {
        handleCopy(
            value ? String(value) : '',
            (e.target as HTMLElement).parentElement || undefined,
        );
    };

    return (
        <div className="copy-textField">
            <TextField
                {...props}
                slotProps={{
                    input: {
                        endAdornment: (
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
