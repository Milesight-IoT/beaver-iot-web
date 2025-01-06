import React, { forwardRef, useCallback, useMemo } from 'react';
import cls from 'classnames';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
// support language
import { yaml } from '@codemirror/lang-yaml';
import { json } from '@codemirror/lang-json';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
// extension language
import { StreamLanguage } from '@codemirror/language';
import { groovy } from '@codemirror/legacy-modes/mode/groovy';

import type { EditorContentProps, EditorSupportLang } from '../../types';
import './style.less';

interface IProps extends EditorContentProps {
    editorLang?: EditorSupportLang;
    editorValue: string;
    setEditorValue: (value: string) => void;
}
/**
 * @docs https://github.com/uiwjs/react-codemirror
 */
export const CodeEditorContent = forwardRef<ReactCodeMirrorRef, IProps>((props, ref) => {
    const {
        showLineNumber = true,
        showFold = true,
        editable = true,
        readOnly = false,
        editorLang,
        editorValue,
        theme,
        setEditorValue,
        ...rest
    } = props;

    /** editor input change callback */
    const onInputChange = useCallback(
        (value: string) => {
            setEditorValue(value);
        },
        [setEditorValue],
    );

    /** Select the corresponding extension based on the language */
    const extensions = useMemo(() => {
        switch (editorLang) {
            case 'yaml':
                return [yaml()];
            case 'json':
                return [json()];
            case 'mvel':
                // The mvel language is similar to java, which is used here for highlighting
                return [java()];
            case 'python':
                return [python()];
            case 'js':
                return [javascript()];
            case 'groovy':
                return [StreamLanguage.define(groovy)];
            case 'markdown':
                return [markdown()];
            case 'text':
            default:
                return [];
        }
    }, [editorLang]);

    return (
        <CodeMirror
            {...rest}
            ref={ref}
            className={cls('ms-code-editor-content', {
                [`ms-editor__lineNumbers--hide`]: !showLineNumber,
                [`ms-editor__foldGutter--hide`]: !showFold,
            })}
            value={editorValue}
            extensions={extensions}
            onChange={onInputChange}
            theme={theme}
            readOnly={readOnly}
            editable={editable}
        />
    );
});

export default React.memo(CodeEditorContent);
