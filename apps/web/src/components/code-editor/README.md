## `CodeEditor` Component Usage

### 1. Default Usage
```jsx
const App = () => {
    return (
        <CodeEditor defaultEditorLang="markdown" />;
    )
}
```

### 2. Controlled Editor Language and Content
```jsx
const App = () => {
    const [editorLang, setEditorLang] = useState('markdown');
    const [editorContent, setEditorContent] = useState('Hello World');

    return (
        <CodeEditor
            editorLang={editorLang}
            onLangChange={setEditorLang}
            value={editorContent}
            onChange={setEditorContent}
        />
    )
}
```

### 3. Hide Certain Features
```jsx
const App = () => {
    return (
        <CodeEditor
            // Hide function fold buttons
            showFold={false}
            // Hide line numbers
            showLineNumber={false}
            // ...other properties
        />
    )
}
``` 

### 4. Read-Only/Edit Mode

```jsx
const App = () => {
    return (
        <CodeEditor
            // Read-only mode: Editing is not allowed, but the cursor position will be shown
            readOnly
            // Edit mode: Only selection and copying are allowed, no cursor or editing behavior
            editable
        />
    );
};
```

### 5. Custom Header

- Simple adjustments, such as modifying only the title and icon
```jsx
import { useCallback } from 'react';
import { CheckCircleIcon } from '@milesight/shared/src/components';
import { CodeEditor, CodeEditorToolbar, type EditorToolbarProps } from '@/components';

const App = () => {
    const renderHeader = useCallback(
        (props: EditorToolbarProps) => (
            <CodeEditorToolbar {...props} icon={<CheckCircleIcon />} title="xxxx" />
        ),
        [],
    );

    return <CodeEditor renderHeader={renderHeader} />;
};
```
OR
```jsx
import { CheckCircleIcon } from '@milesight/shared/src/components';
import { CodeEditor } from '@/components';

const App = () => {
    return <CodeEditor icon={<CheckCircleIcon />} title="xxxx" />;
};
```


- Custom layout, but using some components like `CodeEditorSelect`
```jsx
import { useCallback } from 'react';
import {
    CodeEditor,
    CodeEditorSelect,
    COMMON_EDITOR_HEADER_CLASS,
    type EditorToolbarProps,
} from '@/components';

const App = () => {
    const renderHeader = useCallback(
        (props: EditorToolbarProps) => (
            <div className={COMMON_EDITOR_HEADER_CLASS}>
                {/* Reuse the select component */}
                <CodeEditorSelect
                    {...props}
                    renderOptions={options =>
                        options.map(option => <p key={option.value}>{option.label}</p>)
                    }
                />
                <div>Some styles you want</div>
            </div>
        ),
        [],
    );

    return <CodeEditor renderHeader={renderHeader} />;
};
```

- Fully custom header component
```jsx
import { useCallback } from 'react';
import { CodeEditor, COMMON_EDITOR_HEADER_CLASS, type EditorToolbarProps } from '@/components';

const App = () => {
    const renderHeader = useCallback((props: EditorToolbarProps) => {
        const { editorHandlers } = props;
        const { redo, undo, insert } = editorHandlers || {};

        return (
            <div className={COMMON_EDITOR_HEADER_CLASS}>
                <div>Content</div>
                <div>
                    <div onClick={undo}>undo</div>
                    <div onClick={redo}>redo</div>
                    <div onClick={() => insert('Value you want to insert')}>insert</div>
                </div>
            </div>
        );
    }, []);

    return <CodeEditor renderHeader={renderHeader} />;
};
```