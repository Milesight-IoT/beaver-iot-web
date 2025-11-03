import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { TextField, Autocomplete, type SxProps } from '@mui/material';
import { omit, pick } from 'lodash-es';

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

    const textFieldSx = useMemo(() => {
        const result: SxProps = {
            inputWidth: 0,
            '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
            },
        };

        if (showSearch) {
            result.inputWidth = 185;
            return pick(result, ['inputWidth']);
        }

        return result;
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
                            marginBottom: 0,
                            '.MuiInputBase-root': {
                                backgroundColor: showSearch ? undefined : 'transparent',
                            },
                        },
                        '.MuiAutocomplete-inputRoot input.MuiAutocomplete-input': {
                            minWidth: 0,
                            width: textFieldSx.inputWidth,
                            transition: 'all .2s',
                            '&:focus': {
                                boxShadow: 'none',
                            },
                        },
                        svg: {
                            cursor: 'pointer',
                        },
                        ...omit(textFieldSx, ['inputWidth']),
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
