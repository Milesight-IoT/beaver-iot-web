## `CodeEditor` Component Usage

### Default Usage
```jsx
const App = () => {
    return (
        <CodeEditor defaultEditorLang="markdown" />;
    )
}
```

### Controlled Editor Language and Content
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

### Hide Certain Features
```jsx
const App = () => {
    return (
        <CodeEditor
            // Hide line numbers
            showLineNumber={false}
            // Hide function fold buttons
            showFold={false}
            // ...other properties
        />
    )
}
``` 

### Custom Header

1. Simple adjustments, such as modifying only the title and icon
```jsx
import { CodeEditor, CodeEditorToolbar, type EditorToolbarProps } from '@/components';
import { CheckCircleIcon } from '@milesight/shared/src/components';

const Header = (props: EditorToolbarProps) => {
    return <CodeEditorToolbar {...props} icon={<CheckCircleIcon />} title="xxxx" />;
};
const App = () => {
    return (
        <CodeEditor header={Header} />
    )
}
```

2. Custom layout, but using some components like `CodeEditorSelect`
```jsx
import { CodeEditor, CodeEditorToolbar, type EditorToolbarProps } from '@/components';

const Header = (props: EditorToolbarProps) => {
    return (
        <div>
            {/* Reuse the select component */}
            <CodeEditorSelect {...props} renderOptions={item => <p>{item.label}</p>} />
            <div>Some styles you want</div>
        </div>
    );
};
const App = () => {
    return (
        <CodeEditor header={Header} />
    )
}
```

3. Fully custom header component
```jsx
import { CodeEditor, COMMON_EDITOR_HEADER_CLASS, type EditorToolbarProps } from '@/components';

const Header = (props: EditorToolbarProps) => {
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
};
const App = () => {
    return (
        <CodeEditor header={Header} />
    )
}
```