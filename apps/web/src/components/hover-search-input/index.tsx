import React, { useMemo } from 'react';
import { TextField } from '@mui/material';
import { omit, pick } from 'lodash-es';

import { SearchIcon, CancelIcon } from '@milesight/shared/src/components';

import { useSearch } from './useSearch';
import type { HoverSearchInputProps } from './interface';

/**
 * Component Search input displayed only upon
 * hovering the mouse over the search icon
 */
const HoverSearchInput: React.FC<HoverSearchInputProps> = props => {
    const { keyword, changeKeyword } = props;

    const { showSearch, textFieldRef, inputRef, handleChange, handleMouseEnter, handleMouseLeave } =
        useSearch({
            keyword,
            changeKeyword,
        });

    const textFieldSx = useMemo(() => {
        const result = {
            inputWidth: 0,
            '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
            },
        };

        if (showSearch) {
            result.inputWidth = 120;
            return pick(result, ['inputWidth']);
        }

        return result;
    }, [showSearch]);

    return (
        <TextField
            ref={textFieldRef}
            inputRef={inputRef}
            size="small"
            placeholder="Search"
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
                    width: textFieldSx.inputWidth,
                    transition: 'all .2s',
                },
                svg: {
                    cursor: 'pointer',
                },
                ...omit(textFieldSx, ['inputWidth']),
            }}
        />
    );
};

export default HoverSearchInput;
