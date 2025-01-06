import React, { useCallback } from 'react';
import { CodeEditor, CodeEditorToolbar, EditorToolbarProps } from '@/components';

interface IProps {
    value: string;
    title: React.ReactNode;
}
export default React.memo(({ title, value }: IProps) => {
    const renderHeader = useCallback(
        (props: EditorToolbarProps) => <CodeEditorToolbar {...props} title={title} />,
        [title],
    );
    return (
        <CodeEditor
            height="200px"
            editorLang="json"
            editable={false}
            value={value}
            renderHeader={renderHeader}
        />
    );
});
