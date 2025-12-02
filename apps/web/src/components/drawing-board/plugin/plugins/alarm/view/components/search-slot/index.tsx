import React, { useMemo, useContext, useState } from 'react';
import { IconButton, Divider, type SelectChangeEvent, type SxProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import cls from 'classnames';

import { useI18n, useTheme, useTime } from '@milesight/shared/src/hooks';
import {
    SaveAltIcon,
    Select,
    SearchIcon,
    toast,
    LoadingWrapper,
} from '@milesight/shared/src/components';
import { linkDownload, genRandomString } from '@milesight/shared/src/utils/tools';

import { deviceAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { HoverSearchInput } from '@/components';
import { AlarmContext } from '../../context';

export interface SearchSlotProps {
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
    selectTime: number;
    setSelectTime: React.Dispatch<React.SetStateAction<number>>;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onSelectTime?: (time: number) => void;
}

const SearchSlot: React.FC<SearchSlotProps> = ({
    keyword,
    setKeyword,
    selectTime,
    setSelectTime,
    setModalVisible,
    onSelectTime,
}) => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();
    const { getTimeFormat, dayjs, timezone } = useTime();
    const { setShowMobileSearch, searchConditionRef, isPreview, setPaginationModel } =
        useContext(AlarmContext) || {};

    const [exportLoading, setExportLoading] = useState(false);

    const timeOptions = useMemo(() => {
        return [
            {
                label: getIntlText('dashboard.label_nearly_one_days'),
                value: 1440 * 60 * 1000,
            },
            {
                label: getIntlText('dashboard.label_nearly_three_days'),
                value: 1440 * 60 * 1000 * 3,
            },
            {
                label: getIntlText('dashboard.label_nearly_one_week'),
                value: 1440 * 60 * 1000 * 7,
            },
            {
                label: getIntlText('dashboard.label_nearly_one_month'),
                value: 1440 * 60 * 1000 * 30,
            },
            {
                label: getIntlText('dashboard.label_nearly_three_month'),
                value: 1440 * 60 * 1000 * 90,
            },
            {
                label: getIntlText('common.label.custom'),
                value: -1,
            },
        ];
    }, [getIntlText]);

    const handleSearch = useMemoizedFn((newKeyword: string) => {
        setPaginationModel?.(model => ({ ...model, page: 0 }));
        setKeyword(newKeyword);
    });

    const handleSelectTimeChange = useMemoizedFn((e: SelectChangeEvent<number>) => {
        const val = e?.target?.value as number;
        if (isNil(val) || val === -1) {
            return;
        }

        setSelectTime(val);
        onSelectTime?.(val);
    });

    const handleOptionClick = useMemoizedFn((option: OptionsProps) => {
        if (option?.value === -1) {
            setModalVisible(true);
        }
    });

    const { run: handleExport } = useDebounceFn(
        async () => {
            try {
                setExportLoading(true);
                const params = searchConditionRef?.current;
                if (!params) {
                    return;
                }

                const [error, resp] = await awaitWrap(
                    deviceAPI.exportDeviceAlarms({
                        ...params,
                        timezone,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                const blobData = getResponseData(resp);
                const fileName = `AlarmData_${getTimeFormat(dayjs(), 'simpleDateFormat').replace(
                    /-/g,
                    '_',
                )}_${genRandomString(6, { upperCase: false, lowerCase: true })}.csv`;

                linkDownload(blobData!, fileName);
                toast.success(getIntlText('common.message.operation_success'));
            } finally {
                setExportLoading(false);
            }
        },
        {
            wait: 300,
        },
    );

    const saveAltIconSx = useMemo((): SxProps => {
        const baseSx: SxProps = {
            width: 36,
            height: 36,
            color: 'text.secondary',
            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                color: 'text.secondary',
            },
        };

        if (matchTablet) {
            return baseSx;
        }

        return {
            ...baseSx,
            '&.MuiIconButton-root:hover': {
                backgroundColor: 'var(--hover-background-1)',
                borderRadius: '50%',
            },
        };
    }, [matchTablet]);

    return (
        <div
            className={cls('alarm-view__search-slot', {
                'd-none': isPreview,
            })}
        >
            <Select
                value={selectTime}
                options={timeOptions}
                onChange={handleSelectTimeChange}
                placeholder={getIntlText('common.label.please_select')}
                sx={{
                    marginRight: '4px',
                    '&:hover': {
                        backgroundColor: 'var(--hover-background-1)',
                    },
                    '&.MuiInputBase-root .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '&.MuiInputBase-root.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, &.MuiInputBase-root.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                        {
                            boxShadow: 'none',
                        },
                    '&.MuiInputBase-root.MuiOutlinedInput-root .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input':
                        {
                            paddingRight: '20px',
                        },
                }}
                onOptionClick={handleOptionClick}
            />
            <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ marginRight: '36px' }}
            />
            <div
                className={cls('hover-search', {
                    'mobile-search': matchTablet,
                })}
            >
                {matchTablet ? (
                    <IconButton
                        sx={{
                            width: 36,
                            height: 36,
                            color: 'text.secondary',
                            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                color: 'text.secondary',
                            },
                        }}
                        disableRipple
                        onClick={() => setShowMobileSearch?.(true)}
                    >
                        <SearchIcon sx={{ width: 20, height: 20 }} />
                    </IconButton>
                ) : (
                    <HoverSearchInput
                        inputWidth={135}
                        keyword={keyword}
                        changeKeyword={handleSearch}
                        placeholder={getIntlText('dashboard.placeholder.search_alarm')}
                    />
                )}
            </div>
            {!matchTablet && (
                <LoadingWrapper size={20} loading={exportLoading}>
                    <IconButton sx={saveAltIconSx} onClick={handleExport}>
                        <SaveAltIcon sx={{ width: 20, height: 20 }} />
                    </IconButton>
                </LoadingWrapper>
            )}
        </div>
    );
};

export default SearchSlot;
