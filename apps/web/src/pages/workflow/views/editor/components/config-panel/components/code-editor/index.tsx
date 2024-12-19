import React from 'react';
import { CodeEditor as CodeMirror, type EditorProps } from '@/components';
import './style.less';

/**
 * Code Editor Component
 *
 * Note: Use in CodeNode, IfelseNode
 */
const CodeEditor: React.FC<EditorProps> = ({ value, onChange }) => {
    return (
        <div className="ms-code-editor-config">
            <CodeMirror value={value} onChange={onChange} defaultEditorLang="javascript" />
        </div>
    );
};

export default CodeEditor;
