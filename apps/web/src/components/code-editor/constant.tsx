import type { EditorSupportLang } from './types';

/** Editor language options */
export const editorLangOptions: {
    value: EditorSupportLang;
    label: string;
}[] = [
    {
        value: 'js',
        label: 'JavaScript',
    },
    {
        value: 'python',
        label: 'Python',
    },
    {
        value: 'json',
        label: 'JSON',
    },
    {
        value: 'yaml',
        label: 'YAML',
    },
    {
        value: 'groovy',
        label: 'Groovy',
    },
    {
        value: 'mvel',
        label: 'Mvel',
    },
    {
        value: 'markdown',
        label: 'Markdown',
    },
    {
        value: 'text',
        label: 'Text',
    },
];

/** Common editor header class name  */
export const COMMON_EDITOR_HEADER_CLASS = 'ms-code-editor-header';

export const THEME_MAIN_BG_COLOR = '--editor-main-bg-color';
