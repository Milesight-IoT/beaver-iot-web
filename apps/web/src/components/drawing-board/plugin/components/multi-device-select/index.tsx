import React from 'react';
import {
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    FormHelperText,
    Pagination,
} from '@mui/material';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, RefreshIcon, CancelIcon } from '@milesight/shared/src/components';

import { Tooltip } from '@/components';
import { DeviceGroup, GroupDetail } from './components';
import { MultiDeviceSelectContext } from './context';
import { MAX_COUNT } from './constants';
import type { MultiDeviceSelectProps } from './interface';
import { useData } from './hooks';

import './style.less';

/**
 * Select device component
 */
const MultiDeviceSelect: React.FC<MultiDeviceSelectProps> = props => {
    const { sx, required, label, error, helperText } = props;

    const { getIntlText } = useI18n();
    const {
        selectedDevices,
        contextVal,
        selectedGroup,
        deviceList,
        keyword,
        loadingDevices,
        pageCount,
        selectedUpdating,
        loadingGroups,
        refreshDeviceList,
        setPageNum,
        handleSearch,
        updateSelectedGroup,
        setKeyword,
    } = useData(props);

    const renderContent = () => {
        if (selectedGroup?.id || keyword) {
            return <GroupDetail loading={loadingDevices || selectedUpdating} data={deviceList} />;
        }

        return <DeviceGroup loading={loadingGroups || selectedUpdating} />;
    };

    return (
        <MultiDeviceSelectContext.Provider value={contextVal}>
            <FormControl
                className="multi-device-select"
                fullWidth
                required={required}
                sx={{
                    height: '100%',
                    ...sx,
                }}
            >
                <div className="multi-device-select__header">
                    <InputLabel required={required}>
                        {label || getIntlText('setting.integration.ai_bind_device_choose_device')}
                    </InputLabel>

                    <div className="multi-device-select__header-right">
                        <div className="multi-device-select__count">
                            {getIntlText('common.tip.selected_and_max_count', {
                                1: selectedDevices?.length || 0,
                                2: MAX_COUNT,
                            })}
                        </div>
                        <div className="multi-device-select__refresh" onClick={refreshDeviceList}>
                            <RefreshIcon sx={{ width: '16px', height: '16px' }} />
                            <div>{getIntlText('common.button.refresh')}</div>
                        </div>
                    </div>
                </div>

                <div
                    className={cls('multi-device-select__container', {
                        error,
                    })}
                >
                    <div className="multi-device-select__search">
                        <FormControl fullWidth>
                            <OutlinedInput
                                value={keyword}
                                fullWidth
                                placeholder={getIntlText('common.label.search')}
                                onChange={handleSearch}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                                endAdornment={
                                    keyword ? (
                                        <CancelIcon
                                            sx={{ color: 'var(--gray-4)', cursor: 'pointer' }}
                                            onClick={e => {
                                                e?.preventDefault();
                                                e?.stopPropagation();

                                                setKeyword('');
                                            }}
                                        />
                                    ) : undefined
                                }
                            />
                        </FormControl>
                    </div>

                    <div className="multi-device-select__path">
                        <div
                            className={cls('multi-device-select__path-all', {
                                active: !!selectedGroup,
                            })}
                            onClick={() => {
                                if (!selectedGroup) {
                                    return;
                                }

                                updateSelectedGroup(undefined);
                                setPageNum(1);
                            }}
                        >
                            {getIntlText('common.label.all_groups')}
                        </div>
                        {selectedGroup?.name && (
                            <div className="multi-device-select__path-group">
                                <Tooltip autoEllipsis title={`/ ${selectedGroup.name}`} />
                            </div>
                        )}
                    </div>

                    {renderContent()}

                    {Boolean(selectedGroup?.id || keyword) && (
                        <div className="multi-device-select__pagination">
                            <Pagination
                                size="small"
                                defaultPage={1}
                                count={pageCount}
                                variant="outlined"
                                shape="rounded"
                                onChange={(_, page) => setPageNum(page)}
                                sx={{
                                    'li button:hover': {
                                        backgroundColor: 'transparent',
                                        borderColor: 'var(--primary-color-base)',
                                    },
                                    'li button.Mui-selected': {
                                        backgroundColor: 'transparent',
                                        borderColor: 'var(--primary-color-base)',
                                        color: 'var(--primary-color-base)',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        },
                                    },
                                    'li button.MuiButtonBase-root.Mui-disabled': {
                                        color: 'var(--gray-4)',
                                        backgroundColor: 'var(--gray-2)',
                                    },
                                    ul: {
                                        gap: '4px',
                                    },
                                }}
                            />
                        </div>
                    )}
                </div>

                {!!error && (
                    <FormHelperText error sx={{ mt: 1 }}>
                        {helperText}
                    </FormHelperText>
                )}
            </FormControl>
        </MultiDeviceSelectContext.Provider>
    );
};

export default MultiDeviceSelect;
export type { MultiDeviceSelectProps, DeviceSelectData } from './interface';
