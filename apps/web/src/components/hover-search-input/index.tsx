import React, { useMemo } from 'react';
import { TextField, type SxProps } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, CancelIcon } from '@milesight/shared/src/components';

import { useSearch } from './useSearch';
import type { HoverSearchInputProps } from './interface';

/**
 * Component Search input displayed only upon
 * hovering the mouse over the search icon
 */
const HoverSearchInput: React.FC<HoverSearchInputProps> = props => {
    const { keyword, changeKeyword, inputWidth, placeholder } = props;

    const { getIntlText } = useI18n();
    const { showSearch, textFieldRef, inputRef, handleChange, handleMouseEnter, handleMouseLeave } =
        useSearch({
            keyword,
            changeKeyword,
        });

    /**
     * No show search input custom style
     */
    const noShowSearchTextFieldSx = useMemo((): SxProps | undefined => {
        if (showSearch) {
            return;
        }

        return {
            '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
            },
            '& .MuiInputBase-root.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                boxShadow: 'none',
            },
            '&.MuiFormControl-root .MuiInputBase-root': {
                paddingRight: 1,
                paddingLeft: 0,
                input: {
                    paddingRight: 1,
                },
            },
        };
    }, [showSearch]);

    return (
        <TextField
            ref={textFieldRef}
            inputRef={inputRef}
            size="small"
            placeholder={placeholder || getIntlText('common.label.search')}
            value={keyword}
            onChange={handleChange}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            slotProps={{
                input: {
                    endAdornment: keyword ? (
                        <CancelIcon
                            sx={{ color: 'var(--gray-4)' }}
                            onClick={e => {
                                e?.preventDefault();
                                e?.stopPropagation();

                                changeKeyword('');
                            }}
                        />
                    ) : (
                        <SearchIcon
                            sx={{ color: 'text.secondary' }}
                            color={showSearch ? 'disabled' : 'action'}
                        />
                    ),
                },
            }}
            sx={{
                backgroundColor: 'var(--component-background)',
                '&.MuiFormControl-root': {
                    marginBottom: 0,
                },
                input: {
                    width: showSearch ? inputWidth || 120 : 0,
                    transition: 'all .2s',
                },
                svg: {
                    cursor: 'pointer',
                },
                '&.MuiFormControl-root .MuiInputBase-root': {
                    paddingRight: 1,
                },
                ...noShowSearchTextFieldSx,
            }}
        />
    );
};

export default HoverSearchInput;
