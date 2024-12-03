export * from '@mui/material/styles';
declare module '@mui/material/styles' {
    interface PaletteTextChannel {
        tertiary?: string;
        quaternary?: string;
    }
}

declare module '@mui/material/Checkbox' {
    interface CheckboxPropsColorOverrides {
        tertiary: true;
        quaternary: true;
    }
}
