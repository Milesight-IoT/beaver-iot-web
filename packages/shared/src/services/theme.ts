import {
    blue as MBlue,
    green as MGreen,
    red as MRed,
    grey as MGrey,
    yellow as MYellow,
    deepOrange as MDeepOrange,
} from '@mui/material/colors';
import { merge } from 'lodash-es';
import type { PaletteMode, ColorSystemOptions, CssVarsThemeOptions } from '@mui/material/styles';
import iotStorage from '../utils/storage';

/** Theme type */
export type ThemeType = PaletteMode;

// Cache key of theme (Note: iotStorage will automatically add the `mos.` prefix)
export const THEME_CACHE_KEY = 'theme';
/** The selector of css theme */
export const THEME_COLOR_SCHEMA_SELECTOR = 'data-theme';

/** Theme color - white */
export const white = '#FFFFFF';

/** Theme color - black */
export const black = '#000000';

/** Theme color - blue */
export const blue = {
    ...MBlue,
    200: '#F0F9FF',
    300: '#D9F0FF',
    400: '#B0DDFF',
    500: '#87C7FF',
    600: '#5EAFFF',
    700: '#3491FA',
    800: '#226FD4',
    900: '#1351AD',
} as const;

/** Theme color - green */
export const green = {
    ...MGreen,
    200: '#EBFAEF',
    300: '#BEEDCC',
    400: '#90E0AB',
    500: '#66D48E',
    600: '#40C776',
    700: '#1EBA62',
    800: '#10944E',
    900: '#076E3A',
} as const;

/** Theme - yellow */
export const yellow = {
    ...MYellow,
    200: '#FFFDEB',
    300: '#FFF6C2',
    400: '#FFEC99',
    500: '#FFE070',
    600: '#FFD147',
    700: '#F7BA1E',
    800: '#D1940F',
    900: '#AB7003',
} as const;

/** Theme - red */
export const red = {
    ...MRed,
    200: '#FEEBEE',
    300: '#FFE0DB',
    400: '#FFBAB3',
    500: '#FF928A',
    600: '#FF6661',
    700: '#F13535',
    800: '#CC2328',
    900: '#A6141E',
} as const;

/** Theme color - dark orange */
export const deepOrange = {
    ...MDeepOrange,
    200: '#FFF7F0',
    300: '#FFEAD9',
    400: '#FFD1B0',
    500: '#FFB587',
    600: '#FF975E',
    700: '#F77234',
    800: '#D15321',
    900: '#AB3813',
} as const;

/** Theme color - purple */
export const purple = {
    50: '#F5F2FF',
    100: '#EAE3FD',
    200: '#DDD2FC',
    300: '#CBBBFA',
    400: '#B49CFA',
    500: '#A385F8',
    600: '#8E66FF',
    700: '#7B4EFA',
    800: '#633FC8',
    900: '#462C8E',
} as const;

/** Theme color - gray */
export const grey = {
    ...MGrey,
    50: '#F7F8FA',
    100: '#F2F3F5',
    200: '#E5E6EB',
    300: '#C9CDD4',
    400: '#A9AEB8',
    500: '#86909C',
    600: '#6B7785',
    700: '#4E5969',
    800: '#272E3B',
    900: '#1D2129',
} as const;

/**
 * Is browser current in dark mode
 */
const isDarkMode = ((): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
})();

/** System theme */
export const SYSTEM_THEME: ThemeType = isDarkMode ? 'dark' : 'light';
/** Default theme of application */
export const DEFAULT_THEME: ThemeType = 'light';

/**
 * Init theme
 *
 * Prioritizes changes to the current theme based on the type of theme in the cache, and
 * defaults to the light theme if there is no cache.
 */
export const initTheme = (theme?: ThemeType) => {
    const type = iotStorage.getItem<ThemeType>(THEME_CACHE_KEY) || theme || DEFAULT_THEME;
    const html = document.querySelector('html');

    html?.setAttribute('data-theme', type);
};

/**
 * Get current theme type
 */
export const getCurrentTheme = (): ThemeType => {
    const mode = iotStorage.getItem<ThemeType>(THEME_CACHE_KEY);

    return mode || DEFAULT_THEME;
};

/**
 * Change theme
 * @param theme Theme type
 * @param isPersist Whether to persist in local storage
 */
export const changeTheme = (theme: ThemeType, isPersist = true) => {
    if (!theme) return;

    const html = document.querySelector('html');
    html?.setAttribute('data-theme', theme);
    isPersist && iotStorage.setItem(THEME_CACHE_KEY, theme);
};

/**
 * Get MUI theme configuration
 */
export const getMuiSchemes = () => {
    const lightPalette: ColorSystemOptions['palette'] = {
        grey,
        primary: {
            main: purple[700],
            light: purple[600],
            dark: purple[800],
        },
        secondary: {
            main: '#1261BE',
            light: '#3380CC',
            dark: '#064699',
            contrastText: white,
        },
        error: {
            main: red[700],
            light: red[600],
            dark: red[800],
            contrastText: white,
        },
        warning: {
            main: yellow[700],
            light: yellow[600],
            dark: yellow[800],
            contrastText: white,
        },
        info: {
            main: purple[700],
            light: purple[600],
            dark: purple[800],
            contrastText: white,
        },
        success: {
            main: green[700],
            light: green[600],
            dark: green[800],
            contrastText: white,
        },
        background: {
            default: grey[100],
        },
        text: {
            primary: grey[800],
            secondary: grey[600],
            tertiary: grey[500],
            quaternary: grey[300],
            disabled: grey[200],
        },
        action: {
            disabled: grey[300],
            disabledBackground: grey[100],
        },
        Tooltip: {
            bg: grey[800],
        },
    };
    const darkPalette: ColorSystemOptions['palette'] = {
        grey,
        primary: {
            main: purple[600],
            light: purple[700],
            dark: purple[500],
            contrastText: grey[50],
        },
        secondary: {
            main: '#3380cc',
            light: '#1261BE',
            dark: '#599DD9',
            contrastText: grey[50],
        },
        error: {
            main: red[600],
            light: red[700],
            dark: red[500],
            contrastText: grey[50],
        },
        warning: {
            main: yellow[600],
            light: yellow[700],
            dark: yellow[500],
            contrastText: grey[50],
        },
        info: {
            main: purple[600],
            light: purple[700],
            dark: purple[500],
            contrastText: grey[50],
        },
        success: {
            main: green[600],
            light: green[700],
            dark: green[500],
            contrastText: grey[50],
        },
        background: {
            default: black,
        },
        text: {
            primary: grey[50],
            secondary: grey[100],
            tertiary: grey[200],
            quaternary: grey[300],
            disabled: grey[400],
        },
        Tooltip: {
            bg: grey[800],
        },
    };
    return {
        light: lightPalette,
        dark: darkPalette,
    };
};

/**
 * Get all theme configs
 */
const getThemes = (): Record<ThemeType, any> => {
    const light = {};
    const dark = {};
    return {
        light,
        dark,
    };
};

/**
 * Get MUI component theme configuration
 * @param mode Theme type
 * @link https://mui.com/material-ui/customization/theme-components/
 */
export const getMuiComponents = (mode: ThemeType = 'light') => {
    const result: CssVarsThemeOptions['components'] = {
        // MuiButtonBase: {
        //     defaultProps: {
        //         // No more ripple, on the whole application 💣!
        //         // disableRipple: true,
        //     },
        //     styleOverrides: {
        //         root: {
        //             boxShadow: 'none',
        //         },
        //     },
        // },
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
            },
        },
        MuiChip: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                margin: 'dense',
                slotProps: {
                    inputLabel: { shrink: true },
                },
                sx: { my: 1.5 },
            },
        },
        MuiInput: {
            defaultProps: {
                size: 'small',
                margin: 'dense',
            },
        },
        MuiOutlinedInput: {
            defaultProps: {
                size: 'small',
                margin: 'dense',
            },
        },
        MuiInputLabel: {
            defaultProps: {
                shrink: true,
            },
        },
        MuiTab: {
            defaultProps: {
                disableRipple: true,
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: true,
                placement: 'top',
            },
            styleOverrides: {
                tooltip: {
                    fontSize: '12px',
                },
            },
        },
        MuiSvgIcon: {
            defaultProps: {
                fontSize: 'small',
            },
        },
        MuiIconButton: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'small',
            },
        },
    };

    const theme = getThemes()[mode];
    const resultTheme = merge({}, result, theme);

    return resultTheme;
};

/**
 * Get the corresponding value of the CSS variable name
 * @param vars CSS variables
 * @returns CSS variable values
 */
export const getCSSVariableValue = <T extends string | string[]>(
    vars: T,
): T extends string[] ? Record<string, string> : string => {
    const rootStyle = window.getComputedStyle(document.documentElement);

    if (typeof vars === 'string') {
        const value = rootStyle.getPropertyValue(vars).trim();
        return value as T extends string[] ? Record<string, string> : string;
    }

    const result = {} as Record<string, string>;
    vars.forEach(item => {
        const value = rootStyle.getPropertyValue(item).trim();
        result[item as T[number]] = value;
    });

    return result as T extends string[] ? Record<string, string> : string;
};
