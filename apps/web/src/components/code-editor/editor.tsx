import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useControllableValue } from 'ahooks';
import { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorComponent, EditorHeader } from './components';
import { useEditorCommand } from './hooks';
import type { EditorSupportLang, EditorProps, EditorHandlers } from './types';
import './style.less';

export const CodeEditor = forwardRef<EditorHandlers, EditorProps>((props, ref) => {
    const { Header: CustomHeader, ...rest } = props;
    const editorInstanceRef = useRef<ReactCodeMirrorRef>(null);

    const [editorLang, setEditorLang] = useControllableValue<EditorSupportLang>(props, {
        defaultValuePropName: 'defaultEditorLang',
        valuePropName: 'editorLang',
        trigger: 'onLangChange',
    });
    const [editorValue, setEditorValue] = useControllableValue<string>(props, {
        defaultValuePropName: 'defaultValue',
        valuePropName: 'value',
        trigger: 'onChange',
    });

    const { handlers } = useEditorCommand({ editorInstanceRef });
    /** Methods exposed to external components */
    useImperativeHandle(ref, () => handlers);

    const EditorHeaderComponent = CustomHeader === void 0 ? EditorHeader : CustomHeader!;
    return (
        <div className="ms-code-editor">
            {CustomHeader !== null && (
                <EditorHeaderComponent
                    editorHandlers={handlers}
                    editorLang={editorLang}
                    editorValue={editorValue}
                    setEditorLang={setEditorLang}
                />
            )}
            <EditorComponent
                {...rest}
                ref={editorInstanceRef}
                editorLang={editorLang}
                editorValue={editorValue}
                setEditorValue={setEditorValue}
            />
        </div>
    );
});

export default React.memo(CodeEditor);
