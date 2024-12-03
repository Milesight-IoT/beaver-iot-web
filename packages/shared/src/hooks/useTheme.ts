/**
 * 系统主题相关 Hook
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

    // 主动变更 MUI 主题，否则首次进入时组件库主题默认跟随系统主题
    useEffect(() => {
        changeTheme(theme, false);
    }, [theme, changeTheme]);

    return {
        /** 当前主题 */
        theme,

        /** MUI 主题配置 */
        themeConfig,

        /** 切换主题 */
        changeTheme,

        /** 根据传入的 CSS 变量名获取对应值 */
        getCSSVariableValue: useCallback<typeof themeService.getCSSVariableValue>(
            vars => {
                return themeService.getCSSVariableValue(vars);
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [theme],
        ),

        /** 主题色 - 白 */
        white: themeService.white,

        /** 主题色 - 黑 */
        black: themeService.black,

        /** 主题色 - 蓝 */
        blue: themeService.blue,

        /** 主题色 - 绿 */
        green: themeService.green,

        /** 主题色 - 黄 */
        yellow: themeService.yellow,

        /** 主题色 - 橙 */
        deepOrange: themeService.deepOrange,

        /** 主题色 - 红 */
        red: themeService.red,

        /** 主题色 - 灰 */
        grey: themeService.grey,
    };
};
