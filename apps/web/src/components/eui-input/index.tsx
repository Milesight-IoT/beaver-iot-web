import React, { useState, useMemo } from 'react';
import {
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    type OutlinedInputProps,
} from '@mui/material';
import { useControllableValue } from 'ahooks';
import { useTheme } from '@milesight/shared/src/hooks';
import { isMobile } from '@milesight/shared/src/utils/userAgent';
import { QrCodeScannerIcon } from '@milesight/shared/src/components';
import MobileQRCodeScanner from '../mobile-qrcode-scanner';
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
    const { matchTablet } = useTheme();
    const [value, setValue] = useControllableValue(props);
    const [openScanner, setOpenScanner] = useState(false);
    const scannerAvailable = useMemo(() => {
        const { hostname, protocol } = window.location;
        return (
            isMobile() &&
            matchTablet &&
            (protocol === 'https:' || hostname === 'localhost') &&
            !!navigator.mediaDevices?.getUserMedia
        );
    }, [matchTablet]);

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
                <OutlinedInput
                    id="eui-input"
                    type="text"
                    {...props}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />
                {scannerAvailable && (
                    <>
                        <Button variant="outlined" onClick={() => setOpenScanner(true)}>
                            <QrCodeScannerIcon />
                        </Button>
                        <MobileQRCodeScanner
                            open={openScanner}
                            onClose={() => setOpenScanner(false)}
                            onSuccess={data => setValue(data?.data || '')}
                        />
                    </>
                )}
            </div>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default EuiInput;
