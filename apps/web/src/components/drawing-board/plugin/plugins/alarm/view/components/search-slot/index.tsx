import React, { useMemo } from 'react';
import { Autocomplete, TextField, IconButton, Divider } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { SaveAltIcon } from '@milesight/shared/src/components';

import { HoverSearchInput } from '@/components';

export interface SearchSlotProps {
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
}

const SearchSlot: React.FC<SearchSlotProps> = ({ keyword, setKeyword }) => {
    const { getIntlText } = useI18n();

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

    return (
        <div className="alarm-view__search-slot">
            <Autocomplete
                defaultValue={timeOptions[0]}
                options={timeOptions}
                disableClearable
                renderInput={params => <TextField {...params} variant="standard" />}
                sx={{
                    width: 145,
                    '&.MuiAutocomplete-root div.MuiFormControl-root.MuiFormControl-marginDense.MuiFormControl-fullWidth':
                        {
                            margin: 0,
                        },
                    '& .MuiInputBase-root.MuiInput-root::before, & .MuiInputBase-root.MuiInput-root::after':
                        {
                            display: 'none',
                        },
                }}
                slotProps={{
                    popupIndicator: {
                        disableRipple: true,
                    },
                }}
            />
            <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ marginRight: '36px', marginLeft: '8px' }}
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
