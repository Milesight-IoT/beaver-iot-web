import React, { memo } from 'react';
import { TextField, type TextFieldProps } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon } from '@milesight/shared/src/components';

const SearchInput: React.FC<TextFieldProps> = memo(({ slotProps, ...props }) => {
    const { getIntlText } = useI18n();

    // TODO: clearable ?
    return (
        <TextField
            fullWidth
            autoComplete="off"
            className="ms-mobile-search-input"
            placeholder={getIntlText('common.label.search')}
            slotProps={{
                ...slotProps,
                input: {
                    startAdornment: <SearchIcon />,
                },
            }}
            {...props}
        />
    );
});

export default SearchInput;
