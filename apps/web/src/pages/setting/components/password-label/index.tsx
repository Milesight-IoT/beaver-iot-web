import React, { useMemo, useState } from 'react';
import { IconButton } from '@mui/material';
import { VisibilityIcon, VisibilityOffIcon } from '@milesight/shared/src/components';

import './style.less';

interface IProps {
    /** modal title */
    text: string;
}

/**
 * switch password text component
 */
const PasswordLabel: React.FC<IProps> = props => {
    const { text } = props;
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const showText = useMemo(() => {
        if (!showPassword) {
            return text.replace(/./g, '*');
        }
        return text;
    }, [showPassword, text]);

    // switch password or text
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="ms-password-label">
            <span className="ms-password-label-title">
                {!showPassword ? <span>{showText}</span> : showText}
            </span>
            <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
                sx={{ mr: 0.1 }}
            >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </div>
    );
};

export default PasswordLabel;
