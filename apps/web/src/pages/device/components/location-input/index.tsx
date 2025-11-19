import React, { useState } from 'react';
import { useControllableValue } from 'ahooks';
import { isNil } from 'lodash-es';
import {
    Button,
    IconButton,
    FormControl,
    InputLabel,
    FormHelperText,
    type FormControlProps,
} from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { EditIcon } from '@milesight/shared/src/components';
import { type LocationType } from '@/services/http';
import InputModal from './modal';
import './style.less';

interface Props extends Omit<FormControlProps, 'onChange'> {
    label?: React.ReactNode;

    value?: LocationType;

    required?: boolean;

    error?: boolean;

    helperText?: React.ReactNode;

    onChange?: (value: Props['value']) => void;
}

/**
 * Location input component
 */
const LocationInput: React.FC<Props> = ({
    label,
    error,
    required,
    helperText,
    sx,
    fullWidth,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue<Props['value']>(props);
    const [visible, setVisible] = useState(false);

    return (
        <FormControl
            className="ms-com-location-input-root"
            sx={sx}
            error={error}
            required={required}
            fullWidth={fullWidth}
        >
            {!!label && <InputLabel required={required}>{label}</InputLabel>}
            <div className="ms-com-location-input">
                {isNil(value?.latitude) || isNil(value?.longitude) ? (
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setVisible(true)}
                    >
                        {getIntlText('device.label.edit_position')}
                    </Button>
                ) : (
                    <div className="location-input-detail">
                        <div className="location-input-detail-content">
                            <div className="location-input-detail-item">
                                <span className="location-input-detail-item-label">
                                    {getIntlText('common.label.latitude')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-input-detail-item-value">
                                    {isNil(value.latitude) ? '-' : +value.latitude}
                                </span>
                            </div>
                            <div className="location-input-detail-item">
                                <span className="location-input-detail-item-label">
                                    {getIntlText('common.label.longitude')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-input-detail-item-value">
                                    {isNil(value.longitude) ? '-' : +value.longitude}
                                </span>
                            </div>
                            <div className="location-input-detail-item">
                                <span className="location-input-detail-item-label">
                                    {getIntlText('common.label.address')}
                                    {getIntlText('common.symbol.colon')}
                                </span>
                                <span className="location-input-detail-item-value">
                                    {value?.address || '-'}
                                </span>
                            </div>
                        </div>
                        <div className="location-input-detail-btn">
                            <IconButton onClick={() => setVisible(true)}>
                                <EditIcon />
                            </IconButton>
                        </div>
                    </div>
                )}
            </div>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
            <InputModal
                data={value}
                visible={visible}
                onCancel={() => setVisible(false)}
                onConfirm={data => {
                    setValue(data);
                    setVisible(false);
                }}
            />
        </FormControl>
    );
};

export default LocationInput;
