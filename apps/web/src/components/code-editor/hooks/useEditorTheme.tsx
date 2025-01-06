import { useMemo } from 'react';
import { useTheme } from '@milesight/shared/src/hooks';
import { vscodeDarkInit, vscodeLightInit } from '@uiw/codemirror-theme-vscode';
import { THEME_MAIN_BG_COLOR } from '../constant';
import { getCssVariable } from '../helper';
import { type EditorProps } from '../types';

export const useEditorTheme = ({ fontSize = 18 }: Pick<EditorProps, 'fontSize'>) => {
    const { theme } = useTheme();

    /** editor theme */
    const editorTheme = useMemo(() => {
        const vscodeThemeInit = theme === 'dark' ? vscodeDarkInit : vscodeLightInit;

        return vscodeThemeInit({
            settings: {
                gutterBorder: getCssVariable(THEME_MAIN_BG_COLOR),
                gutterBackground: getCssVariable(THEME_MAIN_BG_COLOR),
                background: getCssVariable(THEME_MAIN_BG_COLOR),
                gutterForeground: 'var(--text-color-tertiary)',
                lineHighlight: 'transparent',
                fontSize: `${fontSize}`,
            },
        });
    }, [theme, fontSize]);

    return {
        editorTheme,
    };
};
