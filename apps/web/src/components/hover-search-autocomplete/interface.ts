import { type AutocompleteProps } from '@mui/material';

export type HoverSearchAutocompleteProps<T = unknown> = Omit<
    AutocompleteProps<T, false, false, false>,
    'renderInput'
>;
