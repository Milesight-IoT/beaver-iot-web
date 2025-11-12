import React, { useMemo, useContext } from 'react';
import { IconButton, Divider, type SelectChangeEvent, type SxProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';

import { useI18n, useTheme, useTime } from '@milesight/shared/src/hooks';
import { SaveAltIcon, Select, SearchIcon, toast } from '@milesight/shared/src/components';
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
    const { getTimeFormat, dayjs } = useTime();
    const { setShowMobileSearch, searchCondition } = useContext(AlarmContext) || {};

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

    const handleExport = useMemoizedFn(async () => {
        if (!searchCondition) {
            return;
        }

        const [error, resp] = await awaitWrap(deviceAPI.exportDeviceAlarms(searchCondition));
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
    });

    const saveAltIconSx = useMemo((): SxProps => {
        const baseSx: SxProps = {
            width: 36,
            height: 36,
            color: 'text.secondary',
        };

        if (matchTablet) {
            return {
                ...baseSx,
                '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                    color: 'text.secondary',
                },
            };
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
        <div className="alarm-view__search-slot">
            <Select
                value={selectTime}
                options={timeOptions}
                onChange={handleSelectTimeChange}
                placeholder={getIntlText('common.label.please_select')}
                sx={{
                    '&.MuiInputBase-root .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                    },
                    '&.MuiInputBase-root.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                        {
                            boxShadow: 'none',
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
            <div className="hover-search">
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
                        inputWidth={125}
                        keyword={keyword}
                        changeKeyword={setKeyword}
                    />
                )}
            </div>
            <IconButton sx={saveAltIconSx} onClick={handleExport}>
                <SaveAltIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
        </div>
    );
};

export default SearchSlot;
