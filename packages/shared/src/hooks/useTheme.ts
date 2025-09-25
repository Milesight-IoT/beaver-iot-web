/**
 * System Theme Hook
 */
import { useMemo, useCallback, useEffect } from 'react';
import { createTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isMobile } from '../utils/userAgent';
import { theme as themeService } from '../services';
import { useSharedGlobalStore } from '../stores';
import useI18n from './useI18n';

const palettes = themeService.getMuiSchemes();

export default () => {
    const { setMode } = useColorScheme();
    const theme = useSharedGlobalStore(state => state.theme);
    const setTheme = useSharedGlobalStore(state => state.setTheme);
    const { muiLocale } = useI18n();

    const muiTheme = useMemo(() => {
        const palette = { mode: theme, ...palettes[theme] };
        const colorSchemes = { [theme]: { palette: palettes[theme] } };
        const components = themeService.getMuiComponents(theme);
        const cssVariables = {
            colorSchemeSelector: themeService.THEME_COLOR_SCHEMA_SELECTOR,
        };

        return createTheme(
            {
                typography: {
                    fontFamily: 'inherit',
                },
                shape: {
                    borderRadius: 6,
                },
                palette,
                colorSchemes,
                components,
                cssVariables,
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 576,
                        md: 768,
                        lg: 992,
                        xl: 1200,
                    },
                },
            },
            muiLocale!,
        );
    }, [theme, muiLocale]);

    const changeTheme = useCallback(
        (type: typeof theme, isPersist?: boolean) => {
            setMode(type);
            setTheme(type);
            themeService.changeTheme(type, isPersist);
        },
        [setMode, setTheme],
    );

    // Change the MUI theme proactively, otherwise the component library
    // theme will follow the system theme by default on first entry.
    useEffect(() => {
        changeTheme(theme, false);
    }, [theme, changeTheme]);

    // ---------- Responsive ----------
    const matchSmBp = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const matchMdBp = useMediaQuery(muiTheme.breakpoints.down('md'));
    const matchLandscape = useMediaQuery('(orientation: landscape)');

    return {
        /** Current Theme */
        theme,

        /** MUI Theme instance */
        muiTheme,

        /**
         * MUI Theme breakpoints
         *
         * Constants:
         * - sm: <576
         * - md: <768
         * - lg: <992
         * - xl: <1200
         */
        breakpoints: muiTheme.breakpoints,

        /** Whether the current device is a mobile device based on breakpoints (width < 576px) */
        matchMobile: matchSmBp || (matchLandscape && isMobile()),

        /** Whether the current device is a tablet device based on breakpoints (width < 768px) */
        matchTablet: matchMdBp || (matchLandscape && isMobile()),

        /** Whether the current device is in landscape orientation */
        matchLandscape,

        /** Change Theme */
        changeTheme,

        /** Get the value based on the CSS variable name passed in */
        getCSSVariableValue: useCallback<typeof themeService.getCSSVariableValue>(
            vars => {
                return themeService.getCSSVariableValue(vars);
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [theme],
        ),

        /** Theme Color - white */
        white: themeService.white,

        /** Theme Color - black */
        black: themeService.black,

        /** Theme Color - blue */
        blue: themeService.blue,

        /** Theme Color - green */
        green: themeService.green,

        /** Theme Color - yellow */
        yellow: themeService.yellow,

        /** Theme Color - deepOrange */
        deepOrange: themeService.deepOrange,

        /** Theme Color - red */
        red: themeService.red,

        /** Theme Color - grey */
        grey: themeService.grey,

        /** Theme Color - purple */
        purple: themeService.purple,
    };
};
