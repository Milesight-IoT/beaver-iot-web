import { useMemo } from 'react';
import { useTheme } from '@milesight/shared/src/hooks';
import { vscodeDarkInit, vscodeLightInit } from '@uiw/codemirror-theme-vscode';
import { type EditorProps } from '../types';

export const useEditorTheme = ({ fontSize = 18 }: Pick<EditorProps, 'fontSize'>) => {
    const { theme, getCSSVariableValue } = useTheme();

    /** editor theme */
    const editorTheme = useMemo(() => {
        const vscodeThemeInit = theme === 'dark' ? vscodeDarkInit : vscodeLightInit;

        return vscodeThemeInit({
            settings: {
                gutterBorder: getCSSVariableValue('--component-background-gray'),
                gutterBackground: getCSSVariableValue('--component-background-gray'),
                background: getCSSVariableValue('--component-background-gray'),
                gutterForeground: getCSSVariableValue('--text-color-tertiary'),
                fontSize: `${fontSize}`,
            },
        });
    }, [theme, getCSSVariableValue, fontSize]);

    return {
        editorTheme,
    };
};
