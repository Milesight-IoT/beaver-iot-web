import React from 'react';
import {
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    type OutlinedInputProps,
} from '@mui/material';
import { QrCodeScannerIcon } from '@milesight/shared/src/components';
import './style.less';

interface Props extends OutlinedInputProps {
    error?: boolean;

    helperText?: React.ReactNode;
}

/**
 * EUI input component
 *
 * Support qrcode scan in mobile device
 */
const EuiInput: React.FC<Props> = ({ label, fullWidth, error, helperText, sx, ...props }) => {
    return (
        <FormControl
            className="ms-com-eui-input-root"
            fullWidth={fullWidth}
            sx={sx}
            required={props.required}
            error={error}
        >
            {!!label && (
                <InputLabel htmlFor="eui-input" required={props.required}>
                    {label}
                </InputLabel>
            )}
            <div className="ms-com-eui-input">
                <OutlinedInput id="eui-input" type="text" {...props} />
                <Button variant="outlined">
                    <QrCodeScannerIcon />
                </Button>
            </div>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default EuiInput;
