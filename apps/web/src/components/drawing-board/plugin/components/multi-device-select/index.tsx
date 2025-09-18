import React, { useMemo, useEffect } from 'react';
import {
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    FormHelperText,
} from '@mui/material';
import { useControllableValue, useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';

import { type DeviceDetail } from '@/services/http';
import { DeviceGroup } from './components';
import { MultiDeviceSelectContext, type MultiDeviceSelectContextProps } from './context';
import { MAX_COUNT } from './constants';

import './style.less';

export interface MultiDeviceSelectProps {
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    error?: boolean;
    helperText?: string | null;
    value?: Partial<DeviceDetail>[];
    onChange?: (newVal: Partial<DeviceDetail>[]) => void;
}

/**
 * Select device component
 */
const MultiDeviceSelect: React.FC<MultiDeviceSelectProps> = props => {
    const { required, label, error, helperText } = props;

    const { getIntlText } = useI18n();
    const [selectedDevices, setSelectedDevices] =
        useControllableValue<Partial<DeviceDetail>[]>(props);

    useEffect(() => {
        console.log('selectedDevices ? ', selectedDevices);
    }, [selectedDevices]);

    const handleSearch = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleSearch ? ', e?.target?.value || '');
    });

    const contextVal = useMemo((): MultiDeviceSelectContextProps => {
        return {
            selectedDevices,
            setSelectedDevices,
        };
    }, [selectedDevices, setSelectedDevices]);

    return (
        <MultiDeviceSelectContext.Provider value={contextVal}>
            <div className="multi-device-select">
                <FormControl fullWidth required={required}>
                    <div className="multi-device-select__header">
                        <InputLabel required={required}>
                            {label ||
                                getIntlText('setting.integration.ai_bind_device_choose_device')}
                        </InputLabel>
                        <div className="multi-device-select__count">
                            {getIntlText('common.tip.selected_and_max_count', {
                                1: selectedDevices?.length || 0,
                                2: MAX_COUNT,
                            })}
                        </div>
                    </div>

                    <div
                        className={cls('multi-device-select__container', {
                            error,
                        })}
                    >
                        <div className="multi-device-select__search">
                            <OutlinedInput
                                fullWidth
                                placeholder={getIntlText('common.label.search')}
                                onChange={handleSearch}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                            />
                        </div>

                        <DeviceGroup />
                    </div>

                    {!!error && (
                        <FormHelperText error sx={{ mt: 1 }}>
                            {helperText}
                        </FormHelperText>
                    )}
                </FormControl>
            </div>
        </MultiDeviceSelectContext.Provider>
    );
};

export default MultiDeviceSelect;
