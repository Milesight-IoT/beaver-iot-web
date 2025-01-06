import React from 'react';
import { TextField, type TextFieldProps } from '@mui/material';

export type MarkdownEditorProps = TextFieldProps;

/**
 * Markdown Editor Component
 *
 * Note: Use in EmailNode
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ ...props }) => {
    return (
        <TextField
            {...props}
            multiline
            fullWidth
            placeholder="Please enter"
            rows={5}
            sx={{ margin: 0 }}
        />
    );
};

export default MarkdownEditor;
