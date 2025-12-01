import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { TextField, Autocomplete, type SxProps } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';

import { useSearch } from './useSearch';
import type { HoverSearchAutocompleteProps, HoverSearchAutocompleteExpose } from './interface';

/**
 * Component Search autocomplete input displayed only upon
 * hovering the mouse over the search icon
 */
function HoverSearchInput<T>(
    props: HoverSearchAutocompleteProps<T>,
    ref: React.ForwardedRef<HoverSearchAutocompleteExpose>,
) {
    const { getIntlText } = useI18n();
    const {
        showSearch,
        open,
        inputRef,
        autocompleteRef,
        handleMouseEnter,
        handleMouseLeave,
        handleOpen,
        toggleShowSearch,
    } = useSearch<T>(props);

    /**
     * Expose methods to parent component
     */
    useImperativeHandle(ref, () => {
        return {
            toggleShowSearch,
        };
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
            '&.MuiFormControl-root.MuiTextField-root .MuiInputBase-root': {
                paddingRight: '25px',
                paddingLeft: 0,
                input: {
                    paddingRight: 1,
                },
            },
        };
    }, [showSearch]);

    return (
        <Autocomplete
            {...props}
            ref={autocompleteRef}
            open={open}
            renderInput={params => (
                <TextField
                    inputRef={inputRef}
                    placeholder={getIntlText('common.label.search')}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onChange={handleOpen}
                    onClick={handleOpen}
                    sx={{
                        backgroundColor: 'transparent',
                        '&.MuiFormControl-root': {
                            maxWidth: '240px',
                            '.MuiInputBase-root': {
                                backgroundColor: showSearch ? undefined : 'transparent',
                            },
                        },
                        '&.MuiFormControl-root.MuiFormControl-marginDense.MuiTextField-root': {
                            marginBottom: 0,
                        },
                        '.MuiAutocomplete-inputRoot input.MuiAutocomplete-input': {
                            minWidth: 0,
                            width: showSearch ? 185 : 0,
                            transition: 'all .2s',
                            '&:focus': {
                                boxShadow: 'none',
                            },
                        },
                        svg: {
                            cursor: 'pointer',
                        },
                        '&.MuiFormControl-root.MuiTextField-root .MuiInputBase-root': {
                            paddingRight: '25px',
                        },
                        ...noShowSearchTextFieldSx,
                    }}
                    {...params}
                />
            )}
            popupIcon={
                <SearchIcon
                    sx={{ color: 'text.secondary' }}
                    color={showSearch ? 'disabled' : 'action'}
                />
            }
            sx={{
                '& .MuiAutocomplete-popupIndicatorOpen': {
                    transform: 'none',
                },
                '& .MuiAutocomplete-endAdornment': {
                    'button.MuiAutocomplete-clearIndicator': {
                        visibility: 'visible',
                    },
                    'button + button': {
                        display: 'none',
                    },
                },
                '&.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon .MuiTextField-root .MuiOutlinedInput-root':
                    {
                        paddingRight: '39px',
                    },
                '.MuiInputBase-root.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    boxShadow: showSearch ? undefined : 'none',
                },
            }}
        />
    );
}

const HoverSearchInputWithRef = forwardRef(HoverSearchInput) as <T>(
    props: HoverSearchAutocompleteProps<T> & {
        ref?: React.ForwardedRef<HoverSearchAutocompleteExpose>;
    },
) => ReturnType<typeof HoverSearchInput>;

export default HoverSearchInputWithRef;
