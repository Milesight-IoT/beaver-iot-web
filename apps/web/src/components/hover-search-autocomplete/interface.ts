import { type AutocompleteProps } from '@mui/material';

export type HoverSearchAutocompleteProps<T = unknown> = Omit<
    AutocompleteProps<T, false, false, false>,
    'renderInput'
>;

export interface HoverSearchAutocompleteExpose {
    toggleShowSearch: (isShow?: boolean) => void;
}
