import React, { useMemo } from 'react';
import { IconButton, Divider, type SelectChangeEvent } from '@mui/material';
import { isNil } from 'lodash-es';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { SaveAltIcon, Select } from '@milesight/shared/src/components';

import { useMemoizedFn } from 'ahooks';
import { HoverSearchInput } from '@/components';

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
                <HoverSearchInput inputWidth={125} keyword={keyword} changeKeyword={setKeyword} />
            </div>
            <IconButton
                sx={{
                    width: 36,
                    height: 36,
                    color: 'text.secondary',
                    '&.MuiIconButton-root:hover': {
                        backgroundColor: 'var(--hover-background-1)',
                        borderRadius: '50%',
                    },
                }}
            >
                <SaveAltIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
        </div>
    );
};

export default SearchSlot;
