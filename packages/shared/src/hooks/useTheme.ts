/**
 * System Theme Hook
 */
import { useMemo, useCallback, useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { theme as themeService } from '../services';
import { useSharedGlobalStore } from '../stores';

const palettes = themeService.getMuiSchemes();

export default () => {
    const { setMode } = useColorScheme();
    const theme = useSharedGlobalStore(state => state.theme);
    const setTheme = useSharedGlobalStore(state => state.setTheme);

    const themeConfig = useMemo(() => {
        const palette = { mode: theme, ...palettes[theme] };
        const colorSchemes = { [theme]: { palette: palettes[theme] } };
        const components = themeService.getMuiComponents(theme);
        const cssVariables = {
            colorSchemeSelector: themeService.THEME_COLOR_SCHEMA_SELECTOR,
        };

        return {
            palette,
            colorSchemes,
            components,
            cssVariables,
        };
    }, [theme]);

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

    return {
        /** Current Theme */
        theme,

        /** MUI Theme Config */
        themeConfig,

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
